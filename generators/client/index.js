/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable consistent-return */
const chalk = require('chalk');
const _ = require('lodash');
const BaseGenerator = require('../generator-base');
const prompts = require('./prompts');
const writeAngularFiles = require('./files-angular').writeFiles;
const writeAngularJsFiles = require('./files-angularjs').writeFiles;
const writeReactFiles = require('./files-react').writeFiles;
const packagejs = require('../../package.json');
const constants = require('../generator-constants');

let useBlueprint;

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);

        this.configOptions = this.options.configOptions || {};

        // This adds support for a `--protractor` flag
        this.option('protractor', {
            desc: 'Enable protractor tests',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--uaa-base-name` flag
        this.option('uaa-base-name', {
            desc: 'Provide the name of UAA server, when using --auth uaa',
            type: String
        });

        // This adds support for a `--build` flag
        this.option('build', {
            desc: 'Provide build tool for the application',
            type: String
        });

        // This adds support for a `--websocket` flag
        this.option('websocket', {
            desc: 'Provide websocket option for the application',
            type: String
        });

        // This adds support for a `--auth` flag
        this.option('auth', {
            desc: 'Provide authentication type for the application',
            type: String
        });

        // This adds support for a `--db` flag
        this.option('db', {
            desc: 'Provide DB name for the application',
            type: String
        });

        // This adds support for a `--social` flag
        this.option('social', {
            desc: 'Provide development DB option for the application',
            type: Boolean,
            default: false
        });

        // This adds support for a `--search-engine` flag
        this.option('search-engine', {
            desc: 'Provide development DB option for the application',
            type: String
        });

        // This adds support for a `--cache-provider` flag
        this.option('cache-provider', {
            desc: 'Provide a cache provider option for the application',
            type: String,
            defaults: 'no'
        });

        // This adds support for a `--hb-cache` flag
        this.option('hb-cache', {
            desc: 'Provide hibernate cache option for the application',
            type: Boolean,
            default: false
        });

        // This adds support for a `--jhi-prefix` flag
        this.option('jhi-prefix', {
            desc: 'Add prefix before services, controllers and states name',
            type: String,
            defaults: 'jhi'
        });

        // This adds support for a `--skip-user-management` flag
        this.option('skip-user-management', {
            desc: 'Skip the user management module during app generation',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--npm` flag
        this.option('npm', {
            desc: 'Use npm instead of yarn',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--experimental` flag which can be used to enable experimental features
        this.option('experimental', {
            desc: 'Enable experimental features. Please note that these features may be unstable and may undergo breaking changes at any time',
            type: Boolean,
            defaults: false
        });

        this.setupClientOptions(this);
        const blueprint = this.options.blueprint || this.configOptions.blueprint || this.config.get('blueprint');
        useBlueprint = this.composeBlueprint(blueprint, 'client'); // use global variable since getters dont have access to instance property
    }

    get initializing() {
        if (useBlueprint) return;
        return {
            displayLogo() {
                if (this.logo) {
                    this.printJHipsterLogo();
                }
            },

            setupClientconsts() {
                // Make constants available in templates
                this.MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
                this.TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;

                this.serverPort = this.config.get('serverPort') || this.configOptions.serverPort || 8080;
                this.applicationType = this.config.get('applicationType') || this.configOptions.applicationType;
                if (!this.applicationType) {
                    this.applicationType = 'monolith';
                }
                this.clientFramework = this.config.get('clientFramework');
                if (!this.clientFramework) {
                    /* for backward compatibility */
                    this.clientFramework = 'angular1';
                }
                if (this.clientFramework === 'angular2') {
                    /* for backward compatibility */
                    this.clientFramework = 'angularX';
                }
                this.useSass = this.config.get('useSass');
                this.enableTranslation = this.config.get('enableTranslation'); // this is enabled by default to avoid conflicts for existing applications
                this.nativeLanguage = this.config.get('nativeLanguage');
                this.languages = this.config.get('languages');
                this.enableI18nRTL = this.isI18nRTLSupportNecessary(this.languages);
                this.messageBroker = this.config.get('messageBroker');
                this.packagejs = packagejs;
                const baseName = this.config.get('baseName');
                if (baseName) {
                    this.baseName = baseName;
                }

                const clientConfigFound = this.useSass !== undefined;
                if (clientConfigFound) {
                    // If translation is not defined, it is enabled by default
                    if (this.enableTranslation === undefined) {
                        this.enableTranslation = true;
                    }
                    if (this.nativeLanguage === undefined) {
                        this.nativeLanguage = 'en';
                    }
                    if (this.languages === undefined) {
                        this.languages = ['en', 'fr'];
                    }

                    this.existingProject = true;
                }
                if (!this.clientPackageManager) {
                    if (this.useYarn) {
                        this.clientPackageManager = 'yarn';
                    } else {
                        this.clientPackageManager = 'npm';
                    }
                }
            },

            validateSkipServer() {
                if (this.skipServer && !(this.databaseType && this.devDatabaseType && this.prodDatabaseType && this.authenticationType)) {
                    this.error(`When using skip-server flag, you must pass a database option and authentication type using ${chalk.yellow('--db')} and ${chalk.yellow('--auth')} flags`);
                }
            }
        };
    }

    get prompting() {
        if (useBlueprint) return;
        return {
            askForModuleName: prompts.askForModuleName,
            askForClient: prompts.askForClient,
            askForClientSideOpts: prompts.askForClientSideOpts,
            askFori18n: prompts.askFori18n,

            setSharedConfigOptions() {
                this.configOptions.clientFramework = this.clientFramework;
                this.configOptions.useSass = this.useSass;
            }
        };
    }

    get configuring() {
        if (useBlueprint) return;
        return {
            insight() {
                const insight = this.insight();
                insight.trackWithEvent('generator', 'client');
                insight.track('app/clientFramework', this.clientFramework);
                insight.track('app/useSass', this.useSass);
                insight.track('app/enableTranslation', this.enableTranslation);
                insight.track('app/nativeLanguage', this.nativeLanguage);
                insight.track('app/languages', this.languages);
            },

            configureGlobal() {
                // Application name modified, using each technology's conventions
                this.camelizedBaseName = _.camelCase(this.baseName);
                this.angularAppName = this.getAngularAppName();
                this.angularXAppName = this.getAngularXAppName();
                this.capitalizedBaseName = _.upperFirst(this.baseName);
                this.dasherizedBaseName = _.kebabCase(this.baseName);
                this.lowercaseBaseName = this.baseName.toLowerCase();
                if (!this.nativeLanguage) {
                    // set to english when translation is set to false
                    this.nativeLanguage = 'en';
                }
            },

            saveConfig() {
                this.config.set('jhipsterVersion', packagejs.version);
                this.config.set('baseName', this.baseName);
                this.config.set('clientFramework', this.clientFramework);
                this.config.set('useSass', this.useSass);
                this.config.set('enableTranslation', this.enableTranslation);
                if (this.enableTranslation && !this.configOptions.skipI18nQuestion) {
                    this.config.set('nativeLanguage', this.nativeLanguage);
                    this.config.set('languages', this.languages);
                }
                this.config.set('clientPackageManager', this.clientPackageManager);
                if (this.skipServer) {
                    this.authenticationType && this.config.set('authenticationType', this.authenticationType);
                    this.uaaBaseName && this.config.set('uaaBaseName', this.uaaBaseName);
                    this.cacheProvider && this.config.set('cacheProvider', this.cacheProvider);
                    this.enableHibernateCache && this.config.set('enableHibernateCache', this.enableHibernateCache);
                    this.websocket && this.config.set('websocket', this.websocket);
                    this.databaseType && this.config.set('databaseType', this.databaseType);
                    this.devDatabaseType && this.config.set('devDatabaseType', this.devDatabaseType);
                    this.prodDatabaseType && this.config.set('prodDatabaseType', this.prodDatabaseType);
                    this.searchEngine && this.config.set('searchEngine', this.searchEngine);
                    this.buildTool && this.config.set('buildTool', this.buildTool);
                }
            }
        };
    }

    get default() {
        if (useBlueprint) return;
        return {
            getSharedConfigOptions() {
                if (this.configOptions.cacheProvider) {
                    this.cacheProvider = this.configOptions.cacheProvider;
                }
                if (this.configOptions.enableHibernateCache) {
                    this.enableHibernateCache = this.configOptions.enableHibernateCache;
                }
                if (this.configOptions.websocket !== undefined) {
                    this.websocket = this.configOptions.websocket;
                }
                if (this.configOptions.clientFramework) {
                    this.clientFramework = this.configOptions.clientFramework;
                }
                if (this.configOptions.databaseType) {
                    this.databaseType = this.configOptions.databaseType;
                }
                if (this.configOptions.devDatabaseType) {
                    this.devDatabaseType = this.configOptions.devDatabaseType;
                }
                if (this.configOptions.prodDatabaseType) {
                    this.prodDatabaseType = this.configOptions.prodDatabaseType;
                }
                if (this.configOptions.messageBroker !== undefined) {
                    this.messageBroker = this.configOptions.messageBroker;
                }
                if (this.configOptions.searchEngine !== undefined) {
                    this.searchEngine = this.configOptions.searchEngine;
                }
                if (this.configOptions.buildTool) {
                    this.buildTool = this.configOptions.buildTool;
                }
                if (this.configOptions.enableSocialSignIn !== undefined) {
                    this.enableSocialSignIn = this.configOptions.enableSocialSignIn;
                }
                if (this.configOptions.authenticationType) {
                    this.authenticationType = this.configOptions.authenticationType;
                }
                if (this.configOptions.otherModules) {
                    this.otherModules = this.configOptions.otherModules;
                }
                if (this.configOptions.testFrameworks) {
                    this.testFrameworks = this.configOptions.testFrameworks;
                }
                this.protractorTests = this.testFrameworks.includes('protractor');

                if (this.configOptions.enableTranslation !== undefined) {
                    this.enableTranslation = this.configOptions.enableTranslation;
                }
                if (this.configOptions.nativeLanguage !== undefined) {
                    this.nativeLanguage = this.configOptions.nativeLanguage;
                }
                if (this.configOptions.languages !== undefined) {
                    this.languages = this.configOptions.languages;
                    this.enableI18nRTL = this.isI18nRTLSupportNecessary(this.languages);
                }

                if (this.configOptions.uaaBaseName !== undefined) {
                    this.uaaBaseName = this.configOptions.uaaBaseName;
                }

                // Make dist dir available in templates
                if (this.configOptions.buildTool === 'maven') {
                    this.BUILD_DIR = 'target/';
                } else {
                    this.BUILD_DIR = 'build/';
                }

                this.styleSheetExt = this.useSass ? 'scss' : 'css';
                this.pkType = this.getPkType(this.databaseType);
                this.apiUaaPath = `${this.authenticationType === 'uaa' ? `${this.uaaBaseName.toLowerCase()}/` : ''}`;
                this.DIST_DIR = this.BUILD_DIR + constants.CLIENT_DIST_DIR;
            },

            composeLanguages() {
                if (this.configOptions.skipI18nQuestion) return;

                this.composeLanguagesSub(this, this.configOptions, 'client');
            }
        };
    }

    writing() {
        if (useBlueprint) return;
        switch (this.clientFramework) {
        case 'angular1':
            return writeAngularJsFiles.call(this);
        case 'react':
            return writeReactFiles.call(this);
        default:
            return writeAngularFiles.call(this);
        }
    }

    install() {
        if (useBlueprint) return;
        let logMsg =
            `To install your dependencies manually, run: ${chalk.yellow.bold(`${this.clientPackageManager} install`)}`;

        if (this.clientFramework === 'angular1') {
            logMsg =
                `To install your dependencies manually, run: ${chalk.yellow.bold(`${this.clientPackageManager} install & bower install`)}`;
        }

        const installConfig = {
            bower: this.clientFramework === 'angular1',
            npm: this.clientPackageManager !== 'yarn',
            yarn: this.clientPackageManager === 'yarn'
        };

        if (this.options['skip-install']) {
            this.log(logMsg);
        } else {
            this.installDependencies(installConfig).then(
                () => {
                    if (this.clientFramework === 'angular1') {
                        this.spawnCommandSync('gulp', ['install']);
                    } else {
                        this.spawnCommandSync(this.clientPackageManager, ['run', 'prettier:format']);
                        this.buildResult = this.spawnCommandSync(this.clientPackageManager, ['run', 'webpack:build']);
                    }
                },
                (err) => {
                    this.warning('Install of dependencies failed!');
                    this.log(logMsg);
                }
            );
        }
    }

    end() {
        if (useBlueprint) return;
        if (this.buildResult !== undefined && this.buildResult.status !== 0) {
            this.error('webpack:build failed.');
        }
        this.log(chalk.green.bold('\nClient application generated successfully.\n'));

        let logMsg =
            `Start your Webpack development server with:\n ${chalk.yellow.bold(`${this.clientPackageManager} start`)}\n`;

        if (this.clientFramework === 'angular1') {
            logMsg =
                'Inject your front end dependencies into your source code:\n' +
                ` ${chalk.yellow.bold('gulp inject')}\n\n` +
                'Generate the AngularJS constants:\n' +
                ` ${chalk.yellow.bold('gulp ngconstant:dev')}` +
                `${this.useSass ? '\n\nCompile your Sass style sheets:\n\n' +
                `${chalk.yellow.bold('gulp sass')}` : ''}\n\n` +
                'Or do all of the above:\n' +
                ` ${chalk.yellow.bold('gulp install')}\n`;
        }
        this.log(chalk.green(logMsg));
    }
};
