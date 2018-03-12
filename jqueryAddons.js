import $ from 'jquery';

/**
 * jqueryAddons
 * @desc
 */

/**
 * jquery plugin to animate scale since it's not supported
 * by the basic .animate() function
 */
export function addonAnimateScale () {
	$.fn.animateScale = function (scaleFrom, scaleTo, options = {}) {
		let $this = $(this),
			from = { scale: scaleFrom },
			trans = $this.css('transform');

		//hide
		$this.css({ visibility: 'hidden' });

		return $this.queue(next => {
			// show element
			$this.css({ visibility: 'visible' });

			let opts = $.extend(
				{},
				{
					step: function (n) {
						setScale($this, n, trans);
					},
					complete: next
				},
				options
			);

			//make sure we catch the complete method (if passed in options)
			if (options.complete) {
				opts.complete = function () {
					options.complete();
					next();
				};
			}

			$(from).animate({ scale: scaleTo }, opts);
		});
	};
}

export function addonAnimateValue () {
	$.fn.animateValue = function (from, to, options = {}) {
		let $this = $(this),
			obj = { value: from };

		return $this.queue(next => {
			let opts = $.extend(
				{},
				{
					step: function (n) {
						$this.text(Math.floor(n));
					},
					complete: next
				},
				options
			);

			// if custom step is passed in, call it instead of default
			if (options.step) {
				opts.step = function (n) {
					let value = Math.floor(n);
					options.step(n, value);
				};
			}

			//make sure we catch the complete method (if passed in options)
			if (options.complete) {
				opts.complete = function () {
					options.complete();
					next();
				};
			}

			$(obj).animate({ value: to }, opts);
		});
	};
}

export function setScale ($element, scale, trans) {
	trans = trans && trans !== 'none' ? trans : '';
	$element.css({ transform: `${trans} scale(${scale})` });
}
