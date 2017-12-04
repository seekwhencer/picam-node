var gpio = require('rpi-gpio');
var Event = require('events');

var Config = require('../config/blink.js');
var PowerSocket = require('./powersocket.js');

module.exports = function (args) {

    var that = this;
    this.driver = gpio;

    this.defaults = {
        pin_map: { // socket - pin
            1: 13, // left top
            2: 12,
            3: 11,
            4: 10, // right top
            5: 3, // left bottom
            6: 5,
            7: 7,
            8: 8 // right bottom
        },
        pin_map_init: that.driver.DIR_HIGH,
    };
    this.options = {};
    this.loop = {
        blink: null
    };
    this.event = null;
    this.sockets = {};

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
        that.on('driver_ready', function () {
            console.log(' GPIO`S READY', Object.keys(that.sockets).length, '\n');
        });
        that.on('powersockets_ready', function () {
            console.log('', Object.keys(that.sockets).length, 'POWER SOCKETS CREATED', '\n');
            that.setup();
        });
        that.on('test_complete', function(){
            console.log(' GPIO TEST COMPLETE', Object.keys(that.sockets).length, '\n');
        });

        that.initPowerSockets();
    };

    this.initPowerSockets = function () {
        Object.keys(that.options.pin_map).forEach(function (number) {
            console.log(' CREATIGN POWER SOCKET ', number);
            that.sockets[number] = new PowerSocket({
                driver: that.driver,
                data: {
                    number: number,
                    pin: that.options.pin_map[number],
                    inital: that.options.pin_map_init,
                    is: false
                },
                options: {
                    //...
                }
            });
        });
        that.emit('powersockets_ready');
    };

    this.setup = function (index) {
        if (index === undefined) {
            index = 0;
        }
        var numbering = Object.keys(that.sockets);
        if (index === numbering.length) {
            that.emit('driver_ready');
            return;
        }
        var socket = that.sockets[numbering[index]];
        socket.setup(function () {
            that.setup(index + 1);
        });
    };

    this.toggleSocket = function (number) {
        if (!number)
            return;

        if (!that.sockets[number])
            return;

        console.log(' TOGGLE NUMBER: ', number);
        that.sockets[number].toggle();
    };


    this.test = function () {
        var index = 0;
        var numbering = Object.keys(that.sockets);
        clearInterval(that.loop.blink);
        that.loop.blink = setInterval(function () {
            if (index === numbering.length) {
                that.emit('test_complete');
                return that.test();
            }
            var socket = that.sockets[numbering[index]];
            socket.trigger();
            index++;
        }, that.options.speed);
    };

    this.triggerSocket = function (number) {
        if (!number)
            return;

        if (!that.sockets[number])
            return;

        console.log(' TRIGGER NUMBER: ', number);
        that.sockets[number].trigger();
    };

    this.turnOnSocket = function (number) {
        if (!number)
            return;

        if (!that.sockets[number])
            return;

        console.log(' TURN ON NUMBER: ', number);
        that.sockets[number].turnOn();
    };
    this.turnOffSocket = function (number) {
        if (!number)
            return;

        if (!that.sockets[number])
            return;

        console.log(' TURN OFF NUMBER: ', number);
        that.sockets[number].turnOff();
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
        test: that.test,
        on: that.on,
        emit: that.emit,
        toggleSocket: that.toggleSocket,
        triggerSocket: that.triggerSocket,
        turnOnSocket: that.turnOnSocket,
        turnOffSocket: that.turnOffSocket
    };

};
