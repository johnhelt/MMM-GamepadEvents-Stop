//
// Module : MMM-GamepadEvents
//

Module.register("MMM-GamepadEvents", {
    defaults: {
        axes: [],
        buttons: [],
        scanFrequency: 150,
        showNotif: true,
        showNotifPressed: false
    },
    controllers: [],
    controllersHistory: [],

    notificationReceived: function (notification, payload, sender) {
        if (notification === "DOM_OBJECTS_CREATED") {
            this.sendSocketNotification("INIT", this.config);
        }

        if (notification === "ALL_MODULES_STARTED") {
            this.initListeners();

            var self = this;
            setInterval(function () {
                self.scanGamepads();
                self.getButtonsValues();
            }, this.config.scanFrequency);
        }
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'SHOW_NOTIF') {
            this.showNotif(payload);
        }

        if (notification === 'CALL_EVENT') {
            this.sendNotification(payload.event, payload.param);
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
        let gamepads = navigator.getGamepads();

        Array.from(gamepads).forEach(gamepad => {
            if (gamepad) {
                this.controllers[gamepad.index] = gamepad;
            }
        });
    },

    getButtonsValues: function () {
        let gamepads = Object.values(this.controllers);
        let controllerHistory;
        let newValues;

        gamepads.map((gamepad, idGamepad) => {
            newValues = {'buttons': {}, 'axes': {}};
            controllerHistory = this.getControllerHistory(idGamepad);

            gamepad.buttons.map((button, idButton) => {
                let pressed = button === 1.0;
                let pressedAt = null;
                let alreadyPressed = false;
                if (typeof button === 'object') {
                    pressed = button.pressed;
                }

                if (pressed) {
                    alreadyPressed = controllerHistory && controllerHistory['buttons'][idButton]['pressed'];

                    if (!alreadyPressed) {
                        pressedAt = Date.now();

                        this.showNotifPressed('button ' + idButton + ' pressed');
                    }
                }

                newValues['buttons'][idButton] = {'pressed': pressed, 'pressedAt': pressedAt};
            });


            gamepad.axes.map((axisValue, idAxis) => {
                let pressed = axisValue < -0.15 || axisValue > 0.15;
                let pressedAt = null;
                let alreadyPressed = false;
                let axis;

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
