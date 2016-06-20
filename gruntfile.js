module.exports = function ( grunt ) {

    grunt.initConfig( {
        uglify: {
            options: {
                mangle   : false,
                sourceMap: true
            },
            dev    : {
                files: {
                    "fancyswitch.min.js": [ "fancyswitch.js" ]
                }
            }
        }
    } );

    grunt.loadNpmTasks( "grunt-contrib-uglify" );
};