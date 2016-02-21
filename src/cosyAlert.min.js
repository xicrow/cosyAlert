/**
 * cosyAlert
 * @author Jan Ebsen <xicrow@gmail.com>
 * @website https://github.com/xicrow/cosyAlert
 */
(function ($) {
	// cosyAlert object
	$.cosyAlert = {
		// Default configuration
		configuration: {
			defaultType: 'alert',
			useQueue   : false
		},

		// Default alert configuration
		configurationAlert: {
			container     : null,
			vPos          : 'top',
			hPos          : 'center',
			autoHide      : true,
			autoHideTime  : 5000,
			showTime      : 400,
			hideTime      : 600,
			onShowComplete: null,
			onHideComplete: null
		},

		// Counter used for ID's
		counter: 0,

		// Are we animating ?
		animating: false,

		// Queue for animations
		animationQueue: [],

		// Object for timers
		timers: {},

		getContainer: function (vPos, hPos) {
			// Get container
			var $container = $('#cosyAlert-container-' + vPos + '-' + hPos);

			// Check if container allready exists
			if (!$container.length) {
				// Create container
				$container = $('<div></div>')
					.attr('class', 'cosyAlert-container ' + vPos + ' ' + hPos)
					.attr('id', 'cosyAlert-container-' + vPos + '-' + hPos)
					.appendTo('body');
			}

			// Return the container element
			return $container;
		},

		getAlert: function (elmId, type, message, alertConfig) {
			var $alert;

			// Check if element ID is an object
			if (typeof(elmId) == 'object') {
				$alert = $(elmId);
			}
			// Attempt to get alert by ID
			else if ($('#' + elmId).length) {
				$alert = $('#' + elmId);
			}
			// Alert does not exist
			else {
				// Check if enough parameters are given to create a new alert element
				if (!type || !message || !alertConfig) {
					// Return false, not enough parameters given
					return false;
				}

				// Create alert
				$alert = $('<div></div>')
					.attr('class', 'cosyAlert ' + type + ' ' + alertConfig.vPos + ' ' + alertConfig.hPos)
					.attr('id', elmId)
					.css({opacity: 0})
					.html(message);

				// Check if custom container is supplied
				if (alertConfig.container && typeof(alertConfig.container) == 'string') {
					$alert.appendTo($(alertConfig.container));
				}
				else {
					// Append or prepend depending on vertical position
					if (alertConfig.vPos == 'bottom') {
						$alert.prependTo($.cosyAlert.getContainer(alertConfig.vPos, alertConfig.hPos));
					}
					else {
						$alert.appendTo($.cosyAlert.getContainer(alertConfig.vPos, alertConfig.hPos));
					}
				}

				// Set alert specific data
				$alert.data('cosyAlert', alertConfig);

				// Add close element
				$('<div></div>')
					.attr('class', 'close')
					.html('&times;')
					.click(function (e) {
						$.cosyAlert.hide($(this).parent()[0].id);
					})
					.prependTo($alert);

				// If alert should automatically hide
				if (alertConfig.autoHide) {
					// Add loader element
					var $alertLoader = $('<div></div>')
						.attr('class', 'loader')
						.appendTo($alert);

					// Add loader bar element
					$('<div></div>')
						.attr('class', 'loader-bar')
						.appendTo($alertLoader);
				}

				// Increment the alert counter
				$.cosyAlert.counter++;
			}

			// Return the alert element
			return $alert;
		},

		add: function (message, type, options, callback) {
			var alertConfig = $.extend({}, $.cosyAlert.configurationAlert, options);

			if (callback && typeof(callback) == 'function') {
				if (!alertConfig.onHideComplete || typeof(alertConfig.onHideComplete) != 'function') {
					alertConfig.onHideComplete = callback;
				}
			}

			var elmId = 'cosyAlert-' + type + '-' + $.cosyAlert.counter;

			alertConfig.id      = elmId;
			alertConfig.timerId = $.cosyAlert.counter;

			$.cosyAlert.getAlert(elmId, type, message, alertConfig);

			return elmId;
		},

		show: function (elmId) {
			// Check if queue is activated, and if we're animating
			if ($.cosyAlert.configuration.useQueue && $.cosyAlert.animating) {
				// Add to queue
				$.cosyAlert.animationQueue.push({action: 'show', elmId: elmId});

				// Return void (there no more to do now)
				return;
			}

			// Get alert element
			var $alert = $.cosyAlert.getAlert(elmId);
			if (!$alert) {
				return false;
			}

			// Get alert configuration
			var alertConfig = $alert.data('cosyAlert');

			// Callback function when animation is complete
			animateCallback = function () {
				$.cosyAlert.animating = false;

				$alert      = $(this);
				alertConfig = $alert.data('cosyAlert');

				if (alertConfig.autoHide) {
					var loaderBar = $(this).find('.loader-bar');
					if (loaderBar.length) {
						loaderBar.animate({width: 0}, alertConfig.autoHideTime, 'linear');
					}

					// Add timer for the alert
					$.cosyAlert.timers[alertConfig.timerId] = window.setTimeout(function () {
						$.cosyAlert.hide(elmId);
					}, alertConfig.autoHideTime);
				}

				// Allways run the queue, just in case there is something in there
				$.cosyAlert.runQueue();

				// Check if onShowComplete callback function is supplied
				if (alertConfig.onShowComplete && typeof(alertConfig.onShowComplete) == 'function') {
					// Run callback function
					alertConfig.onShowComplete();
				}
			};

			// Set default animation options
			var animateOptions = {opacity: 1};

			// Check if custom container is supplied
			if (alertConfig.container && typeof(alertConfig.container) == 'string') {
				$alert.hide()
					.slideDown((alertConfig.showTime / 2))
					.fadeTo((alertConfig.showTime / 2), 1, animateCallback);

				animateOptions = false;
			}
			else {
				// Set animation options based on vertical position
				switch (alertConfig.vPos) {
					case 'top':
						$alert.css({
							marginTop: -($alert.outerHeight(true))
						});
						animateOptions.marginTop = 0;
						break;
					case 'middle':
						if (alertConfig.hPos == 'left') {
							$alert.css({
								marginLeft: -($alert.outerWidth(true))
							});
							animateOptions.marginLeft = 0;
						}
						else if (alertConfig.hPos == 'right') {
							$alert.css({
								marginLeft: ($alert.outerWidth(true))
							});
							animateOptions.marginLeft = 0;
						}
						break;
					case 'bottom' :
						$alert.css({
							marginBottom: -($alert.outerHeight(true))
						});
						animateOptions.marginBottom = 0;
						break;
				}
			}

			// Check if we have animation options
			if (animateOptions) {
				// We're now animating
				$.cosyAlert.animating = true;

				// Animate the alert element
				$alert.animate(animateOptions, alertConfig.showTime, animateCallback);
			}

			// Return true
			return true;
		},

		hide: function (elmId) {
			// Check if queue is activated, and if we're animating
			if ($.cosyAlert.configuration.useQueue && $.cosyAlert.animating) {
				// Add to queue
				$.cosyAlert.animationQueue.push({action: 'hide', elmId: elmId});

				// Return void (there no more to do now)
				return;
			}

			// Get alert element
			var $alert = $.cosyAlert.getAlert(elmId);
			if (!$alert) {
				return false;
			}

			// Get alert configuration
			var alertConfig = $alert.data('cosyAlert');

			// Check if there is a timer for this alert
			if ($.cosyAlert.timers[alertConfig.timerId]) {
				// Clear timeout
				window.clearTimeout($.cosyAlert.timers[alertConfig.timerId]);

				// Delete timer
				delete($.cosyAlert.timers[alertConfig.timerId]);
			}

			// Callback function when animation is complete
			animateCallback = function () {
				$alert      = $(this);
				alertConfig = $alert.data('cosyAlert');

				$(this).remove();

				$.cosyAlert.animating = false;

				$.cosyAlert.checkContainer(alertConfig.vPos, alertConfig.hPos);

				// Allways run the queue, just in case there is something in there
				$.cosyAlert.runQueue();

				// Check if onHideComplete callback function is supplied
				if (alertConfig.onHideComplete && typeof(alertConfig.onHideComplete) == 'function') {
					// Run callback function
					alertConfig.onHideComplete();
				}
			};

			// Set default animation options
			var animateOptions = {opacity: 0};

			// Check if custom container is supplied
			if (alertConfig.container && typeof(alertConfig.container) == 'string') {
				$alert.fadeTo((alertConfig.showTime / 2), 0)
					.slideUp((alertConfig.showTime / 2), animateCallback);

				animateOptions = false;
			}
			else {
				// Set animation options based on vertical position
				switch (alertConfig.vPos) {
					case 'top':
						animateOptions.marginTop = -($alert.outerHeight(true));
						break;
					case 'middle':
						if (alertConfig.hPos == 'left') {
							animateOptions.marginLeft = -($alert.outerWidth(true));
						}
						else if (alertConfig.hPos == 'right') {
							animateOptions.marginLeft = ($alert.outerWidth(true));
						}

						$.cosyAlert.animating = true;
						$alert.animate(animateOptions, alertConfig.hideTime).slideUp(200, animateCallback);
						animateOptions = false;
						break;
					case 'bottom':
						animateOptions.marginBottom = -($alert.outerHeight(true));
						break;
				}
			}

			// Check if we have animation options
			if (animateOptions) {
				// We're now animating
				$.cosyAlert.animating = true;

				// Animate the alert element
				$alert.animate(animateOptions, alertConfig.hideTime, animateCallback);
			}

			// Return true
			return true;
		},

		runQueue: function () {
			// Check if there are any animations in the queue
			if ($.cosyAlert.animationQueue.length) {
				// Loop through the animations
				for (var i in $.cosyAlert.animationQueue) {
					if ($.cosyAlert.animationQueue.hasOwnProperty(i)) {
						// Get animation details
						var animation = $.cosyAlert.animationQueue[i];

						// Run the show animation
						if (animation.action == 'show') {
							$.cosyAlert.show(animation.elmId);
						}
						// Run the hide animation
						else if (animation.action == 'hide') {
							$.cosyAlert.hide(animation.elmId);
						}

						// Remove animation from queue
						$.cosyAlert.animationQueue.splice(i, 1);

						// Check if queue is activated (if the queue has been deactivated for some reason, we need to run the last of the animations)
						if ($.cosyAlert.configuration.useQueue) {
							// Return void (only need to load one animation from the queue at a time)
							return;
						}
					}
				}
			}
		},

		checkContainer: function (vPos, hPos) {
			var $container = $('#cosyAlert-container-' + vPos + '-' + hPos);

			// Check if the container exists
			if ($container.length) {
				// Check if there are any children in the container
				if (!$container.children('.cosyAlert').length) {
					// If no children are found, remove the container
					$container.remove();
				}
			}
		}
	};

	/**
	 * Utility function for easily adding alerts
	 */
	cosyAlert = function (message, type, options, callback) {
		// Check if callback function is supplied
		if (!callback) {
			// Check if type is a function
			if (typeof(type) == 'function') {
				// Set to callback
				callback = type;
			}
			// Check if options is a function
			else if (typeof(options) == 'function') {
				// Set to callback
				callback = options;
			}
		}

		// Check if options is supplied
		if (!options) {
			// Check if type is an object
			if (typeof(type) == 'object') {
				// Set to options
				options = type;
			}
		}

		// Check if type is supplied, and is a string
		if (!type || typeof(type) != 'string') {
			// Set default type
			type = $.cosyAlert.configuration.defaultType;
		}

		// Add an alert
		var $alert = $.cosyAlert.add(message, type, options, callback);

		// Show the alert
		$.cosyAlert.show($alert);

		// Return the alert element
		return $alert;
	};
})(jQuery);
