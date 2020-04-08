# MMM-GamepadEvents
[Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API) for [MagicMirror²](https://magicmirror.builders)

## Main Features
- Send notification based on button or axis pressed
- Exec command based on button or axis pressed
- Support of buttons combinations

## Install
```sh
cd modules
git clone https://github.com/victor-paumier/MMM-GamepadEvents
```

## Using the module
Edit your `config/config.js` file and add a new object to the `modules`:
```js
{
  module: "MMM-GamepadEvents",
  config: {
    showNotif : true,
    showNotifPressed: false,
    scanFrequency: 150,
    combinations: []
  }
}
```

### Configuration options:

| Option                       | Description
| ---------------------------- | -----------
| `showNotif`                  | Show a notification on event sent or command executed. <br> <br> **Default value:** `true`
| `showNotifPressed`           | Show a notification on button pressed. Useful to get button id or axis. <br><br> **Default value:** `false`
| `scanFrequency`              | Frequency of the scan of inputs. <br> <br> **Default value:** `150`
| `combinations`               | Array of combinations with their event or command. <br>(see Combination options) <br> <br> **Default value:** `[]`


### Combination options:
| Option                       | Description
| ---------------------------  | -----------
| `gamepad`                    | Array of buttons and/or axis parameters. <br> (see Gamepad options) <br> <br> **Required**
| `command`                    | The command to exec on combination pressed 
| `event`                      | The event to send on combination pressed <br> <br> **Optional**
| `param`                      | The param of the event <br> <br> **Optional**
| `repeatEvent`                | Send event only one time or repeat it each time the input is scanned <br> <br> **Default value:** `false`


### Gamepad options:
You can either define a button or more, a single axis with its axisValue, or both button(s) and axis.

`Important`: currently, this module has only been develop in the way to allow a single axis to be triggered in a single direction at a time  

| Option                       | Description
| ---------------------------- | -----------
| `buttons`                    | Array of button ids. <br> <br> **Optional** <br> <br> **Default value:** `[]`
| `axis`                       | The horizontal or vertical axis.<br> <br> **Optional** <br><br> **Possible values:** `X` or `Y`
| `axisValue`                  | The corresponding value of axis to decide between left/right or up/down <br> <br> **Optional** <br><br> **Possible values:** `-1` or `1`


### Note
As the combinations are executed in the same order they are defined, and can only be call one time per scan (see `scanFrequency` parameter), it is recommend to defined combinations with multiple buttons (or buttons with axis) before combination with single gamepad actions 

#### ToDo

- Short/Long press
- Specific showNotif per combination (& showNotifPressed?) options