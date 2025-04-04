/*  
    http://www.dailycoding.com/
	with a few changes made for its use in Xerte Online Toolkits (add class to image and magnifier, include offset in calculating magnifier position & allow magnification over original image size)
*/
(function ($) {
    $.fn.imageLens = function (options) {

        var defaults = {
            lensSize	:100,
            borderSize	:2,
            borderColor	:"#666666"
        };
		
        var options = $.extend(defaults, options);
		
		options.radius = options.radius != undefined ? ((options.lensSize / 2 + options.borderSize) / 100) * options.radius : options.lensSize / 2 + options.borderSize;
		
        var lensStyle = "background-position: 0px 0px;width: " + String(options.lensSize) + "px;height: " + String(options.lensSize)
            + "px;float: left;display: none;border-radius: " + String(options.radius)
            + "px;border: " + String(options.borderSize) + "px solid " + options.borderColor 
            + ";background-repeat: no-repeat;position: absolute;cursor: none;";
			
        return this.each(function () {
            obj = $(this);

            var offset = $(this).offset();
			
            // Creating lens
            var target = $("<div style='" + lensStyle + "' class='magnifier'>&nbsp;</div>").appendTo($(this).parent());
            var targetSize = target.size();
			
            // Calculating actual size of image
            var imageSrc = options.imageSrc ? options.imageSrc : $(this).attr("src");
            var imageTag = "<img class='magnifiedImg' style='display:none;' src='" + imageSrc + "' />";

            var widthRatio = 0;
            var heightRatio = 0;
			
            $(imageTag).load(function () {
                widthRatio = $(this).width() / obj.width();
                heightRatio = $(this).height() / obj.height();
				
				// force magnification even if has to be shown larger than original image
				if (options.force != undefined && options.force != false) {
					if (widthRatio <= options.force) {
						$(this).width(obj.width() * options.force);
						$(this).height(obj.height() * options.force);
						widthRatio = $(this).width() / obj.width();
						heightRatio = $(this).height() / obj.height();
					}
				}
				
				target.css('background-size', $(this).width() + 'px ' + $(this).height() + 'px');
            }).appendTo($(this).parent());
			
            target.css({ backgroundImage: "url('" + imageSrc + "')" });
			
            target.mousemove(setPosition);
            $(this).mousemove(setPosition);
			
            function setPosition(e) {
                var leftPos = e.pageX - offset.left;
                var topPos = e.pageY - offset.top;
				
                if (leftPos < 0 || topPos < 0 || leftPos > obj.width() || topPos > obj.height()) {
                    target.hide();
                    $(".magnifiedImg").removeClass("escape");
                }
                else if (!$(".magnifiedImg").hasClass("escape")) {
                    target.show();
					
                    leftPos = String(((e.pageX - offset.left) * widthRatio - target.width() / 2) * (-1));
                    topPos = String(((e.pageY - offset.top) * heightRatio - target.height() / 2) * (-1));
                    target.css({ backgroundPosition: leftPos + 'px ' + topPos + 'px' });

                    const offsetLeft = parseInt($x_mainHolder.css("padding-left")) + parseInt($x_mainHolder.css("margin-left"));
                    const offsetTop = parseInt($x_mainHolder.css("padding-top")) + parseInt($x_mainHolder.css("margin-top"));
					
                    leftPos = String(e.pageX - (target.width() / 2) - offsetLeft);
                    topPos = String(e.pageY - (target.height() / 2) - $x_headerBlock.height() - offsetTop);
                    target.css({ left: leftPos + 'px', top: topPos + 'px' });
                }
            }
        });
    };
})(jQuery);