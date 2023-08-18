//
// Module : MMM-GamepadEvents-Stop
//

Module.register("MMM-GamepadEvents-Stop", {
    defaults: {
        axes: [],
        buttons: [],
        scanFrequency: 150,
        showNotif: false,
        showNotifPressed: false,
        combinations: []
    },
    controllers: [],
    controllersHistory: [],

    stopMM: function() {
        Log.info("attempting to stop MM");
        this.sendSocketNotification("STOPMM", "");
    },

    notificationReceived: function (notification, payload, sender) {
        switch (notification) {
            case 'DOM_OBJECTS_CREATED':
                this.sendSocketNotification("INIT", this.config);    
                break;
                
            case 'ALL_MODULES_STARTED':
                this.initListeners();                

                var self = this;
                setInterval(function () {
                    self.scanGamepads();
                    self.getButtonsValues();
                }, this.config.scanFrequency);
                break;
        }
    },

    socketNotificationReceived: function(notification, payload) {
        switch (notification) {
            case 'SHOW_NOTIF':
                this.showNotif(payload);
                break;
                
            case 'CALL_EVENT':
                this.sendNotification(payload.event, payload.param);
                break;
        }
    },

    initListeners: function () {
        window.addEventListener('gamepadconnected', ({gamepad}) => {
            this.controllers[gamepad.index] = gamepad;
        });

        window.addEventListener('gamepaddisconnected', ({gamepad}) => {
            delete this.controllers[gamepad.index];
            delete this.controllersHistory[gamepad.index];
        });
    },

    scanGamepads: function () {
        var gamepads = navigator.getGamepads();

        Array.from(gamepads).forEach(gamepad => {
            if (gamepad) {
                this.controllers[gamepad.index] = gamepad;
            }
        });
    },

    getButtonsValues: function () {
        var gamepads = Object.values(this.controllers);
        var controllerHistory;
        var newValues;

        gamepads.map((gamepad, idGamepad) => {
            newValues = {'buttons': {}, 'axes': {}};
            controllerHistory = this.getControllerHistory(idGamepad);

            gamepad.buttons.map((button, idButton) => {
                var pressed = button === 1.0;
                var pressedAt = null;
                var alreadyPressed = false;
                if (typeof button === 'object') {
                    pressed = button.pressed;
                }

                if (pressed) {
                    alreadyPressed = controllerHistory && controllerHistory['buttons'][idButton]['pressed'];

                    if (!alreadyPressed) {
                        pressedAt = Date.now();

                        this.showNotifPressed('button ' + idButton + ' pressed');
                        this.sendNotification("GAMEPAD_BUTTON_PRESSED", {button: idButton});
                        if (idButton == 1) {
                            this.stopMM();
                        }
                    }
                }

                newValues['buttons'][idButton] = {'pressed': pressed, 'pressedAt': pressedAt};
            });


            gamepad.axes.map((axisValue, idAxis) => {
                var pressed = axisValue < -0.15 || axisValue > 0.15;
                var pressedAt = null;
                var alreadyPressed = false;
                var axis;

                if (idAxis === 0) {
                    axis = 'X';
                } else {
                    axis = 'Y';
                }

                if (pressed) {
                    alreadyPressed = controllerHistory && controllerHistory['axes'][axis]['pressed'];

                    if (!alreadyPressed) {
                        pressedAt = Date.now();

                        this.showNotifPressed('axis ' + axis + ' with axisValue ' + axisValue + ' pressed');
                    }
                }

                newValues['axes'][axis] = {'axisValue': axisValue, 'pressed': pressed, 'pressedAt': pressedAt};
            });

            this.sendSocketNotification("EXEC_COMBINATION", {'controller': newValues, 'controllerHistory': controllerHistory});
            this.controllersHistory[idGamepad] = newValues;
        });
    },

    getControllerHistory: function(idGamepad) {
        if (idGamepad in this.controllersHistory) {
            return this.controllersHistory[idGamepad];
        } else {
            return null;
        }
    },

    showNotif: function (message) {
        if (this.config.showNotif) {
            this.sendNotification("SHOW_ALERT",
                {
                    type: "notification",
                    title: 'MMM-GamepadEvents',
                    message: message
                }
            );
        }
    },

    showNotifPressed: function (message) {
        if (this.config.showNotifPressed) {
            this.sendNotification("SHOW_ALERT",
                {
                    type: "notification",
                    title: 'MMM-GamepadEvents',
                    message: message
                }
            );
        }
    }
});
