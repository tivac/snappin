"use strict";

var fs   = require("fs"),
    path = require("path"),

    ms      = require("ms"),
    log     = require("npmlog"),
    same    = require("looks-same"),
    Pageres = require("pageres"),
    
    cli     = require("meow")(`
        Usage
            $ snappin --time 30s localhost:3000
        
        Options
            --time,  -t  Interval between captures
            --dir,   -d  Directory to save captures to (./snaps)
            --wait,  -w  Delay initial snap by a specified time (5s)
            --level, -l  Logging level (info)
            --delay, -y  Delay capture after page load (1s)
            --res,   -r  Viewport resolution (1366x768)
    `, {
        alias : {
            time  : "t",
            dir   : "d",
            wait  : "w",
            level : "l",
            delay : "y",
            res   : "r"
        },

        default : {
            time  : "30s",
            dir   : "./snaps",
            wait  : "5s",
            level : "info",
            delay : "1",
            res   : "1366x768"
        }
    }),
    
    previous;

log.level = cli.flags.level;

if(!cli.input.length) {
    log.error("You must specify a site to capture");

    return cli.showHelp(1);
}

log.verbose(`Saving shots to: ${cli.flags.dir}`);

function capture() {
    log.http(`Capturing ${cli.input[0]}`);

    new Pageres({
        filename : "<%= date %> - <%= time %>",
        delay    : cli.delay
    })
    .src(cli.input[0], [ cli.flags.res ])
    .dest(path.resolve(cli.flags.dir))
    .run()
    .then((args) => {
        var current = path.resolve(cli.flags.dir, args[0].filename);
        
        log.info(`Captured ${args[0].filename}`);

        if(!previous) {
            previous = current;

            return next();
        }

        same(
            previous,
            current,
            (error, equal) => {
                if(error) {
                    throw error;
                }
                
                if(!equal) {
                    previous = current;

                    return next();
                }

                log.warn("Duplicate capture, discarding");
            
                fs.unlinkSync(current);

                return next();
            }
        );
    })
    .catch((error) => {
        log.error(error);

        return next();
    });
}

function next() {
    return setTimeout(capture, ms(cli.flags.wait));
}

if(cli.flags.wait) {
    return next();
}

capture();
