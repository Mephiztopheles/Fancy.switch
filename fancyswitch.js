(function ( window, $ ) {

    Fancy.require( {
        jQuery: false,
        Fancy : "1.0.1"
    } );
    var NAME    = "FancySwitch",
        VERSION = "1.1.0",
        $doc    = $( document ),
        logged  = false;

    var template     = '<div class="FancySwitch-item">{{name}}<div class="FancySwitch-up">$upText$</div><div class="FancySwitch-down">$downText$</div></div>',
        templateIcon = '<div class="FancySwitch-item">{{name}}<div class="FancySwitch-up $upClass$"></div><div class="FancySwitch-down $downClass$"></div></div>',
        templateDrag = '<div class="FancySwitch-item">{{name}}</div>';

    function change( SELF, index, index2 ) {

        if ( Fancy.template ) {
            SELF.templates.forEach( function ( it ) {
                it.update();
            } );
        }
        SELF.settings.onSwitch.call( SELF, index, index2 );
    }

    function swapArrayElements( arr, indexA, indexB ) {
        var temp             = arr[ indexA ];
        arr[ indexA ]        = arr[ indexB ];
        arr[ indexB ]        = temp;
        arr[ indexA ].$index = indexA;
        arr[ indexB ].$index = indexB;
    }

    function FancySwitch( element, settings, list ) {
        var SELF = this;

        SELF.settings = $.extend( {}, Fancy.settings[ NAME ], settings );
        delete SELF.settings.templates;
        SELF.visible = false;
        if ( !logged ) {
            logged = true;
            Fancy.version( SELF );
        }
        SELF.list      = list || [];
        SELF.element   = element;
        SELF.version   = VERSION;
        SELF.name      = NAME;
        SELF.items     = SELF.element.find( SELF.settings.itemSelector );
        SELF.animating = false;
        if ( Fancy.template ) {
            SELF.templates = [];
        }

        if ( !SELF.list.length ) {
            SELF.element.on( "DOMNodeInserted." + NAME + "DOMNodeRemoved." + NAME, function () {
                if ( SELF.element.find( SELF.settings.itemSelector ).length != SELF.items.length ) {
                    SELF.update();
                }
            } );
        } else {
            if ( !SELF.settings.template ) {
                if ( SELF.settings.drag ) {
                    SELF.settings.template = templateDrag;
                } else if ( SELF.settings.upText && SELF.settings.downText ) {
                    SELF.settings.template = template;
                } else if ( SELF.settings.upClass && SELF.settings.downClass ) {
                    SELF.settings.template = templateIcon;
                }
                if ( !SELF.settings.template ) {
                    throw "Error: could not define template";
                }
            }
        }
        SELF.element.addClass( NAME + "-element" );


        if ( SELF.settings.drag ) {
            SELF.element.addClass( NAME + "-draggable" );
        }

        SELF.process();

        return SELF;
    }


    FancySwitch.api = FancySwitch.prototype = {};
    FancySwitch.api.version = VERSION;
    FancySwitch.api.name    = NAME;
    FancySwitch.api.up      = function ( item, animated ) {
        var SELF = this;
        var prev = item.prev();
        if ( prev.length ) {
            var index = SELF.items.index( item );
            if ( SELF.list.length ) {
                swapArrayElements( SELF.list, index, index - 1 );
            }
            if ( animated === false || SELF.settings.animated === false ) {
                item.insertBefore( prev );
                SELF.items = SELF.element.find( SELF.settings.itemSelector );
                change( SELF, index, index - 1 );
            } else if ( !SELF.animating ) {
                SELF.animating = !SELF.animating;
                item.css( "position", "relative" ).animate( {
                    top: "-" + prev.height() + "px"
                }, 500, function () {
                    item.css( "position", item.data( "position" ) ).css( "top", item.data( "top" ) );
                } );
                prev.css( "position", "relative" ).animate( {
                    top: "+" + item.height() + "px"
                }, 500, function () {
                    prev.css( "position", prev.data( "position" ) ).css( "top", prev.data( "top" ) );
                    item.insertBefore( prev );
                    SELF.animating = !SELF.animating;
                    SELF.items     = SELF.element.find( SELF.settings.itemSelector );
                    change( SELF, index, index - 1 );
                } );
            }
        }
    };
    FancySwitch.api.down    = function ( item, animated ) {
        var SELF = this;
        var next = item.next();
        if ( item.next().length ) {
            var index = SELF.items.index( item );
            if ( SELF.list.length ) {
                swapArrayElements( SELF.list, index, index + 1 );
            }
            if ( animated === false || SELF.settings.animated === false ) {
                item.insertAfter( next );
                SELF.items = SELF.element.find( SELF.settings.itemSelector );
                change( SELF, index, index + 1 );
            } else if ( !SELF.animating ) {
                SELF.animating = !SELF.animating;
                item.css( "position", "relative" ).animate( {
                    top: "+" + next.height() + "px"
                }, 500, function () {
                    item.css( "position", item.data( "position" ) ).css( "top", item.data( "top" ) );
                } );
                next.css( "position", "relative" ).animate( {
                    top: "-" + item.height() + "px"
                }, 500, function () {
                    next.css( "position", next.data( "position" ) ).css( "top", next.data( "top" ) );
                    item.insertAfter( next );
                    SELF.animating = !SELF.animating;

                    swapArrayElements( SELF.items, index, index + 1 );
                    SELF.items = SELF.element.find( SELF.settings.itemSelector );
                    change( SELF, index, index + 1 );
                } );
            }
        }
    };
    FancySwitch.api.update  = function () {
        if ( !this.list.length ) {
            this.items = this.element.find( this.settings.itemSelector );
        }
        this.process();
    };
    FancySwitch.api.process = function () {

        function processTemplateItem( item ) {

            item.data( "processed", true ).data( "position", item.css( "position" ) === "static" ? "" : item.css( "position" ) ).data( "top", item.css( "top" ) === "auto" ? "" : item.css( "top" ) );
            var $el;
            if ( !item.find( SELF.settings.upSelector ).length && !SELF.settings.drag ) {
                if ( SELF.settings.upSelector.indexOf( "." ) === 0 ) {
                    $el = $( "<div/>", {
                        "class": SELF.settings.upSelector.substr( 1 )
                    } );
                } else {
                    $el = $( "<" + SELF.settings.upSelector + "/>" );
                }
                $el.addClass( SELF.settings.upClass ).html( SELF.settings.upText );

                item.append( $el );
            } else if ( SELF.settings.drag ) {
                item.find( SELF.settings.upSelector ).remove();
            }
            if ( !item.find( SELF.settings.downSelector ).length && !SELF.settings.drag ) {
                if ( SELF.settings.downSelector.indexOf( "." ) === 0 ) {
                    $el = $( "<div/>", {
                        "class": SELF.settings.downSelector.substr( 1 )
                    } );
                } else {
                    $el = $( "<" + SELF.settings.downSelector + "/>" );
                }
                $el.addClass( SELF.settings.downClass ).html( SELF.settings.downText );

                item.append( $el );
            } else if ( SELF.settings.drag ) {
                item.find( SELF.settings.downSelector ).remove();
            }

            if ( !SELF.settings.drag ) {
                Fancy( item.find( SELF.settings.upSelector ) ).preventSelect().click( function () {
                    SELF.up( item );
                } );

                Fancy( item.find( SELF.settings.downSelector ) ).preventSelect().click( function () {
                    SELF.down( item );
                } );
            } else {
                item.addClass( NAME + "-draggable-item" );
                var offset,
                    handler = SELF.settings.handler ? item.find( SELF.settings.handler ) : item;
                Fancy( handler ).preventSelect().on( "mousedown." + NAME, function ( e ) {
                    var clone;

                    if ( e.which === 1 ) {
                        Fancy( $( "body" ) ).preventSelect();
                        offset = {
                            x: e.pageX - item.offset().left,
                            y: e.pageY - item.offset().top
                        };
                        SELF.settings.onChangeStart.call( SELF );
                        $doc.on( "mousemove." + NAME, function ( event ) {
                            if ( !clone ) {
                                clone = item.clone();
                                if ( Fancy.getType( SELF.settings.cloneAppendTo ) == "string" ) {
                                    $( SELF.settings.cloneAppendTo ).append( clone );
                                } else if ( Fancy.getType( SELF.settings.cloneAppendTo ) == "function" ) {
                                    SELF.settings.cloneAppendTo.call( SELF, item ).append( clone );
                                }
                                clone.css( {
                                    width : Fancy( item ).fullWidth(),
                                    zIndex: (parseInt( item.css( "zIndex" ) ) || 10) + 1
                                } ).addClass( NAME + "-draggable-clone" ).addClass( SELF.settings.cloneClass );
                            }

                            clone.css( {
                                top : Math.min( SELF.items.last().offset().top, Math.max( SELF.items.first().offset().top, event.pageY - offset.y ) ),
                                left: item.offset().left
                            } );
                            if ( clone.offset().top > item.offset().top + (item.height() / 3 * 2) ) {
                                SELF.down( item, false );
                            } else if ( clone.offset().top + (item.height() / 3 * 2) < item.offset().top ) {
                                SELF.up( item, false );
                            }
                        } ).on( "mouseup." + NAME, function ( event ) {
                            if ( event.which === 1 ) {
                                if ( clone ) {
                                    Fancy( "body" ).allowSelect();
                                    clone.animate( {
                                        top: item.offset().top
                                    }, 300, function () {
                                        clone.remove();
                                        clone = null;
                                    } );
                                    $doc.off( "." + NAME );
                                } else {
                                    $doc.off( "." + NAME );
                                }
                                SELF.settings.onChange.call( SELF );
                            }
                        } );
                    }
                } );
            }
        }

        var SELF = this;
        if ( SELF.list.length ) {
            SELF.list.forEach( function ( it, i ) {
                it.$index    = i;
                var item;
                var template = SELF.settings.template.replace( /\$([^$}]*)\$/g, function ( match, $1 ) {
                    return SELF.settings[ $1.trim() ];
                } );
                if ( !Fancy.template ) {
                    template = template.replace( /\{\{([^\{}]*)\}\}/g, function ( match, $1 ) {
                        return it[ $1.trim() ];
                    } );
                }
                item = $( template );
                if ( Fancy.template ) {
                    SELF.templates.push( Fancy( item ).template( { scope: it } ).compile() );
                }
                SELF.element.append( item );
                SELF.items = SELF.items.add( item );
                processTemplateItem( SELF.settings.handler ? item.find( SELF.settings.handler ) : item );
            } );
        } else {
            SELF.items.each( function () {
                var item = $( this );
                if ( !item.data( "processed" ) ) {
                    processTemplateItem( item );
                }
            } );
        }
    };
    FancySwitch.api.destroy = function () {
        var SELF = this;
        SELF.items.each( function () {
            var item = $( this );
            item.data( "processed", undefined ).data( "position", undefined ).data( "top", undefined );
            item.off( "." + NAME );
            item.find( SELF.settings.downSelector ).remove();
            item.find( SELF.settings.upSelector ).remove();
        } )
    };

    Fancy.settings[ NAME ] = {
        drag         : false,
        animated     : true,
        itemSelector : ".FancySwitch-item",
        upSelector   : ".FancySwitch-up",
        downSelector : ".FancySwitch-down",
        upClass      : false,
        downClass    : false,
        cloneAppendTo: "body",
        cloneClass   : false,
        upText       : "Up",
        downText     : "Down",
        template     : false,
        templates    : { "buttonText": template, "buttonClass": templateIcon, "drag": templateDrag },
        onChangeStart: function () {},
        onChange     : function () {},
        onSwitch     : function () {},
        handler      : false
    };

    Fancy.switch     = VERSION;
    Fancy.api.switch = function ( settings, list ) {
        return this.set( NAME, function ( el ) {
            return new FancySwitch( el, settings, list );
        } );
    };

})( window, jQuery );
