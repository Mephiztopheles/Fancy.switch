(function ( window, $ ) {

    Fancy.require ( {
        jQuery: false,
        Fancy : "1.0.1"
    } );
    var NAME    = "FancySwitch",
        VERSION = "1.0.1",
        logged  = false;

    function preventSelect ( el ) {
        return el.on ( "selectstart", false ).attr ( 'unselectable', "on" ).css ( "userSelect", "none" );
    }

    function FancySwitch ( element, settings ) {
        var SELF = this;

        SELF.settings = $.extend ( {}, Fancy.settings[ NAME ], settings );
        SELF.visible  = false;
        if ( !logged ) {
            logged = true;
            Fancy.version ( SELF );
        }
        SELF.element   = element;
        SELF.version   = VERSION;
        SELF.name      = NAME;
        SELF.items     = SELF.element.find ( SELF.settings.itemSelector );
        SELF.animating = false;
        SELF.element.addClass ( NAME + "-element" );

        SELF.element.on ( "DOMNodeInserted." + NAME + "DOMNodeRemoved." + NAME, function () {
            if ( SELF.element.find ( SELF.settings.itemSelector ).length != SELF.items.length )
                SELF.update ();
        } );

        if ( SELF.settings.drag ) {
            SELF.element.addClass ( NAME + "-draggable" );
        }

        SELF.process ();

        return SELF;
    }


    FancySwitch.api = FancySwitch.prototype = {};
    FancySwitch.api.version = VERSION;
    FancySwitch.api.name    = NAME;
    FancySwitch.api.up      = function ( item, animated ) {
        var SELF = this;
        var prev = item.prev ();
        if ( prev.length ) {
            if ( animated === false || SELF.settings.animated === false ) {
                item.insertBefore ( prev );
                SELF.items = SELF.element.find ( SELF.settings.itemSelector );
            } else if ( !SELF.animating ) {
                SELF.animating = !SELF.animating;
                item.css ( "position", "relative" ).animate ( {
                    top: "-" + prev.height () + "px"
                }, 500, function () {
                    item.css ( "position", item.data ( "position" ) ).css ( "top", item.data ( "top" ) );
                } );
                prev.css ( "position", "relative" ).animate ( {
                    top: "+" + item.height () + "px"
                }, 500, function () {
                    prev.css ( "position", prev.data ( "position" ) ).css ( "top", prev.data ( "top" ) );
                    item.insertBefore ( prev );
                    SELF.animating = !SELF.animating;
                    SELF.items     = SELF.element.find ( SELF.settings.itemSelector );
                    SELF.settings.onChange.call ( SELF );
                } );
            }
        }
    };
    FancySwitch.api.down    = function ( item, animated ) {
        var SELF = this;
        var next = item.next ();
        if ( item.next ().length ) {
            if ( animated === false || SELF.settings.animated === false ) {
                item.insertAfter ( next );
                SELF.items = SELF.element.find ( SELF.settings.itemSelector );
            } else if ( !SELF.animating ) {
                SELF.animating = !SELF.animating;
                item.css ( "position", "relative" ).animate ( {
                    top: "+" + next.height () + "px"
                }, 500, function () {
                    item.css ( "position", item.data ( "position" ) ).css ( "top", item.data ( "top" ) );
                } );
                next.css ( "position", "relative" ).animate ( {
                    top: "-" + item.height () + "px"
                }, 500, function () {
                    next.css ( "position", next.data ( "position" ) ).css ( "top", next.data ( "top" ) );
                    item.insertAfter ( next );
                    SELF.animating = !SELF.animating;
                    SELF.items     = SELF.element.find ( SELF.settings.itemSelector );
                    SELF.settings.onChange.call ( SELF );
                } );
            }
        }
    };
    FancySwitch.api.update  = function () {
        this.items = this.element.find ( this.settings.itemSelector );
        this.process ();
    };
    FancySwitch.api.process = function () {
        var SELF = this;

        SELF.items.each ( function () {
            var item = $ ( this );
            if ( !item.data ( "processed" ) ) {
                item.data ( "processed", true ).data ( "position", item.css ( "position" ) === "static" ? "" : item.css ( "position" ) ).data ( "top", item.css ( "top" ) === "auto" ? "" : item.css ( "top" ) );
                var $el;
                if ( !item.find ( SELF.settings.upSelector ).length && !SELF.settings.drag ) {
                    if ( SELF.settings.upSelector.indexOf ( "." ) === 0 ) {
                        $el = $ ( "<div/>", {
                            class: SELF.settings.upSelector.substr ( 1 )
                        } );
                    } else {
                        $el = $ ( "<" + SELF.settings.upSelector + "/>" );
                    }
                    $el.addClass ( SELF.settings.upClass ).html ( SELF.settings.upText );

                    item.append ( $el );
                } else if ( SELF.settings.drag ) {
                    item.find ( SELF.settings.upSelector ).remove ();
                }
                if ( !item.find ( SELF.settings.downSelector ).length && !SELF.settings.drag ) {
                    if ( SELF.settings.downSelector.indexOf ( "." ) === 0 ) {
                        $el = $ ( "<div/>", {
                            class: SELF.settings.downSelector.substr ( 1 )
                        } );
                    } else {
                        $el = $ ( "<" + SELF.settings.downSelector + "/>" );
                    }
                    $el.addClass ( SELF.settings.downClass ).html ( SELF.settings.downText );

                    item.append ( $el );
                } else if ( SELF.settings.drag ) {
                    item.find ( SELF.settings.downSelector ).remove ();
                }

                if ( !SELF.settings.drag ) {
                    preventSelect ( item.find ( SELF.settings.upSelector ) ).click ( function () {
                        SELF.up ( item );
                    } );

                    preventSelect ( item.find ( SELF.settings.downSelector ) ).click ( function () {
                        SELF.down ( item );
                    } );
                } else {
                    item.addClass ( NAME + "-draggable-item" );
                    var offset;
                    preventSelect ( item ).on ( "mousedown." + NAME, function ( e ) {
                        var clone;

                        if ( e.which === 1 ) {
                            offset = {
                                x: e.pageX - item.offset ().left,
                                y: e.pageY - item.offset ().top
                            };
                            $ ( document ).on ( "mousemove." + NAME, function ( event ) {
                                if ( !clone ) {
                                    clone = item.clone ();
                                    $ ( "body" ).append ( clone );
                                    clone.css ( {
                                        width : Fancy ( item ).fullWidth (),
                                        zIndex: (parseInt ( item.css ( "zIndex" ) ) || 10) + 1
                                    } ).addClass ( NAME + "-draggable-clone" );
                                }

                                clone.css ( {
                                    top : Math.min ( SELF.items.last ().position ().top, Math.max ( SELF.items.first ().position ().top, event.pageY - offset.y ) ),
                                    left: item.offset ().left
                                } );
                                if ( clone.position ().top > item.position ().top + (item.height () / 3 * 2) ) {
                                    SELF.down ( item, false );
                                } else if ( clone.position ().top + (item.height () / 3 * 2) < item.position ().top ) {
                                    SELF.up ( item, false );
                                }

                            } ).on ( "mouseup." + NAME, function ( event ) {
                                if ( event.which === 1 && clone ) {
                                    clone.animate ( {
                                        top: item.position ().top
                                    }, 300, function () {
                                        clone.remove ();
                                        clone = null;
                                    } );
                                    $ ( document ).off ( "." + NAME );
                                }
                            } );
                        }

                    } );
                }
            }
        } );
    };
    FancySwitch.api.destroy = function () {
        var SELF = this;
        SELF.items.each ( function () {
            var item = $ ( this );
            item.data ( "processed", undefined ).data ( "position", undefined ).data ( "top", undefined );
            item.off ( "." + NAME );
            item.find ( SELF.settings.downSelector ).remove ();
            item.find ( SELF.settings.upSelector ).remove ();
        } )
    };

    Fancy.settings[ NAME ] = {
        drag        : false,
        animated    : true,
        itemSelector: ".FancySwitch-item",
        upSelector  : ".FancySwitch-up",
        downSelector: ".FancySwitch-down",
        upClass     : "",
        downClass   : "",
        upText      : "Up",
        downText    : "Down",
        onChange    : function () {}
    };

    Fancy.switch     = VERSION;
    Fancy.api.switch = function ( settings ) {
        return this.set ( NAME, function ( el ) {
            return new FancySwitch ( el, settings );
        } );
    };

}) ( window, jQuery );