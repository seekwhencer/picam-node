var spawn = require('child_process').spawn;
var Event = require('events');

module.exports = function (args) {
    var that = this;
    this.options = {};
    this.defaults = {
        binary_path: ''
    };
    that.options = that.defaults;

    if (args) {
        if (typeof args.options === 'object') {
            that.options = Object.assign(that.defaults, args.options);
        }
    }

    this.event = null;
    this.process = null;

    this.init = function () {
        that.event = new Event();
        that.on('start', function () {
            console.log(' STARTING MOTION - WAITING ... ');
        });
        that.on('ready', function () {
            console.log(' MOTION IS UP AND RUNNING ', '\n');
        });
        that.start();
    };

    this.start = function () {
        that.emit('start');
        that.run();
    };

    this.run = function () {
        var options = ['start'];
        var console_output = '';
        var matchReg = new RegExp(/event_new_video/);

        that.process = spawn(that.options.binary_path + 'motion', options);
        that.process.stdout.setEncoding('utf8');
        that.process.stderr.setEncoding('utf8');

        that.process.stderr.on('data', function (chunk) {
            console_output += chunk + '\n';
            var match = chunk.match(matchReg);
            if (match != null) {
                that.emit('ready');
            }
        });

        that.process.stderr.on('end', function () {
            console.log(' CLI: ', options.join(' '));
        });
    };

    this.quit = function () {

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
        start: that.start,
        on: that.on,
        emit: that.emit
    };
};