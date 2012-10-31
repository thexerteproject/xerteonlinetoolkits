/*  
    http://www.dailycoding.com/
	with a few changes made for its use in Xerte Online Toolkits (add class to image and magnifier and include offset in calculating magnifier position)
*/
(function ($) {
    $.fn.imageLens = function (options) {
		
        var defaults = {
            lensSize	:100,
            borderSize	:2,
            borderColor	:"#666666"
        };
        var options = $.extend(defaults, options);
        var lensStyle = "background-position: 0px 0px;width: " + String(options.lensSize) + "px;height: " + String(options.lensSize)
            + "px;float: left;display: none;border-radius: " + String(options.lensSize / 2 + options.borderSize)
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
            }).appendTo($(this).parent());
			
            target.css({ backgroundImage: "url('" + imageSrc + "')" });
			
            target.mousemove(setPosition);
            $(this).mousemove(setPosition);
			
            function setPosition(e) {
				
                var leftPos = parseInt(e.pageX - offset.left);
                var topPos = parseInt(e.pageY - offset.top);
				
                if (leftPos < 0 || topPos < 0 || leftPos > obj.width() || topPos > obj.height()) {
                    target.hide();
                }
                else {
                    target.show();
					
                    leftPos = String(((e.pageX - offset.left) * widthRatio - target.width() / 2) * (-1));
                    topPos = String(((e.pageY - offset.top) * heightRatio - target.height() / 2) * (-1));
                    target.css({ backgroundPosition: leftPos + 'px ' + topPos + 'px' });
					
                    leftPos = String(e.pageX - (target.width() / 2));
                    topPos = String(e.pageY - (target.height() / 2) - $headerBlock.height());
                    target.css({ left: leftPos + 'px', top: topPos + 'px' });
                }
            }
        });
    };
})(jQuery);