(function(){

  CKEDITOR.plugins.add( 'xotlightbox', {});

  CKEDITOR.on( 'dialogDefinition', function( ev ) {
    const name = ev.data.name;

    if( name == 'link' )
    {
      const definition = ev.data.definition;
      const originalSetup = definition.contents[1].elements[0].children[0].setup;

      // Patch the Link dialog setup function to display the Lightbox element
      definition.contents[1].elements[0].children[0].setup = function (data) {
        if (data.target.type === "frame" && data.target.name === "_lightbox")
          data.target.type = "_lightbox";

        originalSetup.call(this, data);
      };

      // Add the Lightbox entry as a target
  		definition.contents[1].elements[0].children[0].items.push(["Lightbox", "_lightbox"]);
    }
  });
})();
