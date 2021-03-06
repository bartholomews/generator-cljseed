'use strict';

const chalk = require('chalk');
const slugify = require("underscore.string/slugify");
const underscored = require("underscore.string/underscored");

const Generator = require('yeoman-generator');

function random(max) {
    return Math.floor(Math.random() * Math.floor(max))
}

function srcPath(appName, src) {
    return `${appName}/${src}/${underscored(appName)}`;
}

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);
        this.argument('app_name', {type: String, required: false});
    }

    _setProject() {
        return [{
            type: 'input',
            name: 'project-name',
            message: 'Enter your project name',
            default: this.options.app_name || 'lisp-teapot' + random(9000)
        },
            {
                type: 'input',
                name: 'project-version',
                message: 'Enter the project version',
                default: '0.1.0-SNAPSHOT'
            }
        ]
    }

    // _copy(appName, from, to, opts) {
    //     this.fs.copy(
    //         this.templatePath(from),
    //         this.destinationPath(to), opts)
    // }

    _write(from, to, opts) {
        this.fs.copyTpl(
            this.templatePath(from),
            this.destinationPath(to), opts)
    }

    go() {
        this.prompt(this._setProject()).then((answers) => {
            const app_name = answers['project-name'];
            const app_version = answers['project-version'];
            const opts = {
                app_name: app_name,
                version: app_version,
                app_path: `${slugify(app_name)}`
            };
            this._write('root', app_name, opts);
            this._write('src', srcPath(app_name, 'src'), opts);
            this._write('test', srcPath(app_name, 'test'), opts);

            this.log(chalk.bold.greenBright(`${app_name} created successfully.`));
            this.log('Run ' + chalk.yellow(`cd ${app_name}`) + ', then you have the following commands available:');
            this.log('To start the REPL with autobuilding and reloading of the src code, execute ' +
                chalk.yellow('lein fig:dev'));
            this.log('To run tests, execute ' + chalk.yellow('lein fig:test'));
            this.log('To build an uberjar, execute ' + chalk.yellow('lein package'));
            this.log('then run ' + chalk.yellow(`java -jar target/${app_name}-${app_version}-standalone.jar`));
            this.log('To deploy the jar to heroku, execute ' + chalk.yellow(`heroku create ${app_name} && lein heroku deploy`));
            //
            this.log(chalk.bold.cyan('Please note: ')
                + chalk.cyan('if you get ')
                + chalk.red(`"Name ${app_name} is already taken"`)
                + chalk.cyan(', replace the Heroku name in ')
                + chalk.blue('project.clj')
                + chalk.cyan(' under ')
                + chalk.blue(':heroku {:app-name')
                + chalk.cyan(' field, then run the `heroku create` command with the new name and ')
                + chalk.yellow('lein heroku deploy')
            );
        });
    }
};
