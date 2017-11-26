var chokidar = require('chokidar');
var Event = require('events');
var Config = require('../config/watch.js');

module.exports = function (args) {
    var that = this;

    this.defaults = {};
    this.options = {};
    this.event = null;
    this.watcher = null;

    //
    this.init = function () {
        that.defaults = Object.assign(that.defaults, Config);
        that.options = that.defaults;
        if (args) {
            if (typeof args.options === 'object') {
                that.options = Object.assign(that.defaults, args.options);
            }
        }
        that.event = new Event();

        that.on('ready', function () {
            console.log(' WATCHER READY ', '\n');
        });

        //that.on('new_file', function (path) {
        //    console.log(' NEW IMAGE ADDED: ', path);
        //});

        that.watcher = chokidar.watch(that.options.folder, {
            ignored: /(^|[\/\\])\../,
            persistent: true,
            ignoreInitial: true
        });

        that.watcher.on('add', function (path) {
            that.emit('new_file', path);
        });

        that.emit('ready');
    };


    // on event wrapper
    this.on = function () {
        that.event.on.apply(that.event, Array.from(arguments));
    };

    // emit event wrapper
    this.emit = function () {
        that.event.emit.apply(that.event, Array.from(arguments));
    };

    that.init();

    return {
        on: that.on,
        emit: that.emit
    };

};