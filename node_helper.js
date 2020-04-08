var exec = require('child_process').exec;

module.exports = NodeHelper.create({
    start: function () {
        this.config = null;
    },

    initAfterLoading: function (config) {
        this.config = config;
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "INIT") {
            this.initAfterLoading(payload);
        }

        if (notification === "EXEC_COMBINATION") {
            this.execCombination(payload.controller, payload.controllerHistory)
        }
    },

    execCombination: function(controller, controllerHistory) {
        var combinationsExecuted = [];
        var canSendEvent;
        var alreadyPressed;
        var message;

        this.config.combinations.forEach((combination) => {
            if ('gamepad' in combination) {
                canSendEvent = true;
                alreadyPressed = true;

                if ('buttons' in combination.gamepad) {
                    combination.gamepad.buttons.forEach((idButton) => {
                        if (!controller['buttons'][idButton]['pressed'] ||
                            combinationsExecuted.some((combinationExecuted) => {
                                return 'buttons' in combinationExecuted.gamepad.buttons &&
                                    combinationExecuted.gamepad.buttons.includes(idButton)
                                ;
                            })
                        ) {
                            canSendEvent = false;
                        } else if (!controllerHistory || !controllerHistory['buttons'][idButton]['pressed']) {
                            alreadyPressed = false;
                        }
                    });
                }

                if (canSendEvent) {
                    if ('axis' in combination.gamepad && 'axisValue' in combination.gamepad) {
                        if (combination.gamepad.axis in controller['axes'] &&
                            combination.gamepad.axisValue  === controller['axes'][combination.gamepad.axis].axisValue
                        ) {
                            if (!controller['axes'][combination.gamepad.axis]['pressed'] ||
                                combinationsExecuted.some((combinationExecuted) => {
                                    return 'axis' in combinationExecuted.gamepad &&
                                        'axisValue' in combinationExecuted.gamepad &&
                                        combinationExecuted.gamepad.axis === combination.gamepad.axis &&
                                        combinationExecuted.gamepad.axisValue === combination.gamepad.axisValue
                                        ;
                                })
                            ) {
                                canSendEvent = false;
                            } else if (!controllerHistory || !controllerHistory['axes'][combination.gamepad.axis]['pressed']) {
                                alreadyPressed = false;
                            }
                        } else {
                            canSendEvent = false;
                        }
                    }
                }

                if (canSendEvent) {
                    if (!alreadyPressed ||
                        ('repeatEvent' in combination && combination.repeatEvent)
                    ) {

                        message = '';

                        if ('event' in combination) {
                            this.sendSocketNotification('CALL_EVENT', combination);

                            message = 'Event : ' + combination.event;
                            if ('param' in combination) {
                                message += '(' + combination.param + ')';
                            }
                        } else if ('command' in combination) {
                            exec(combination.command, function (error, stdout, stderr) {
                                if (stdout) console.log(stdout);
                                if (stderr) console.log(stderr);
                            });

                            message = 'Command : ' + combination.command;
                        }

                        this.sendSocketNotification('SHOW_NOTIF', message);
                    }

                    combinationsExecuted.push(combination);
                }
            }
        });
    },
});