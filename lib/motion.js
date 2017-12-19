var spawn = require('child_process').spawn;
var Event = require('events');

module.exports = function (args) {
    var that = this;
    this.options = {};
    this.defaults = {
        binary_path: '',
        movement_timeout: 2000
    };

    that.options = that.defaults;

    if (args) {
        if (typeof args.options === 'object') {
            that.options = Object.assign(that.defaults, args.options);
        }
    }

    this.event = null;
    this.process = null;
    this.timeout_movement_stop = null;
    this.last_move = null;

    this.init = function () {
        that.event = new Event();
        that.on('start', function () {
            console.log(' STARTING MOTION - WAITING ... ');
        });
        that.on('ready', function () {
            console.log(' MOTION IS UP AND RUNNING ');
        });
        that.on('failed_to_open', function () {
            console.log(' MOTION FAILS TO OPEN THE VIDEO DEVICE ');
        });
        that.on('closing_video_device', function () {
            console.log(' MOTION CLOSING VIDEO DEVICE ');
        });
        that.on('new_file', function(chunk){
            var f = chunk.split('saved to: ');
            var filename = f[1].trim();
            console.log(' MOTION SAVE FILE: ', filename);

            var now = parseInt(Date.now());
            var diff = now - that.last_move;
            if (diff > that.options.movement_timeout || that.last_move === false) {
                that.emit('movement_start');
            }

            clearTimeout(that.timeout_movement_stop);
            that.timeout_movement_stop = setTimeout(function () {
                that.emit('movement_stop');
            }, that.options.movement_timeout);
            that.last_move = now;
        });

        that.on('movement_start', function () {
            console.log('\n',' >>>MOVEMENT START ');
        });
        that.on('movement_stop', function () {
            console.log(' >>> MOVEMENT STOP ');
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
        var last_chunk = '';
        var matchReg = new RegExp(/event_new_video/);

        // the key is the event name
        var match = {
            ready : new RegExp(/event_new_video/),
            new_file: new RegExp(/event_newfile/),
            //movement_start : new RegExp(/Motion detected/),
            //movement_stop : new RegExp(/End of event/),
            failed_to_open: new RegExp(/Failed to open/),
            closing_video_device: new RegExp(/Closing video device/)
        };

        that.process = spawn(that.options.binary_path + 'motion', options);
        that.process.stdout.setEncoding('utf8');
        that.process.stderr.setEncoding('utf8');

        that.process.stderr.on('data', function (chunk) {
            last_chunk = chunk;
            Object.keys(match).forEach(function(key){
                if(chunk.match(match[key])){
                    that.emit(key, chunk);
                }
            });
        });

        that.process.stderr.on('end', function () {
            console.log(' CLI: ', last_chunk);
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