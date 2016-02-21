# cosyAlert

Better alerts for JavaScript, see examples in the `demo` directory.

## Description

`cosyAlert( message [, type ] [, options ] [, callback ] )`

## Configuration

Configuration can be set globally or per instance.

`$.cosyAlert.configuration`

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| defaultType | string | 'alert' | The default type for alerts |
| useQueue | boolean | false | Enable/disable queue for alerts |

`$.cosyAlert.configurationAlert`

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| container | null/string | null | jQuery selector for custom container |
| vPos | string | 'top' | Vertical position (top, middle, bottom) |
| hPos | string | 'center' | Horizontal position (left, center, right) |
| autoHide | boolean | true | Hide the alert automatically |
| autoHideTime | int | 4000 | Time in miliseconds for autohiding alert |
| showTime | int | 400 | Time in miliseconds for showing alert |
| hideTime | int | 600 | Time in miliseconds for hiding alert |
| onShowComplete | null/function | null | Callback when alert is shown |
| onHideComplete | null/function | null | Callback when alert is hidden |

## License
Copyright &copy; 2016 Jan Ebsen
Licensed under the MIT license.
