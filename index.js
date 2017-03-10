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
            delay : "1s",
            res   : "1366x768"
        }
    }),
    
    files, previous;

log.level = cli.flags.level;

if(!cli.input.length) {
    log.error("You must specify a site to capture");

    return cli.showHelp(1);
}

log.verbose(`Saving shots to: ${cli.flags.dir}`);

// Convert some cli args where it makes sense
cli.flags.dir   = path.resolve(cli.flags.dir);
cli.flags.wait  = ms(cli.flags.wait);
cli.flags.delay = Math.floor(ms(cli.flags.delay) / 1000);

function capture() {
    log.http(`Capturing ${cli.input[0]}`);

    new Pageres({
        filename : "<%= date %> - <%= time %>",
        delay    : cli.delay
    })
    .src(cli.input[0], [ cli.flags.res ])
    .dest(cli.flags.dir)
    .run()
    .then((args) => {
        var capped  = args[0].filename,
            current = path.join(cli.flags.dir, capped);

        if(!previous) {
            log.info(`Captured ${capped}`);

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
                    log.info(`Captured ${capped}`);

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
    return setTimeout(capture, cli.flags.wait);
}

// Determine most recent file to use for comparisons
files = fs.readdirSync(cli.flags.dir)
    .map((file) => {
        file = path.join(cli.flags.dir, file);
        
        return {
            file,
            time : fs.statSync(file).mtime
        };
    })
    .sort((a, b) =>
        a.time - b.time
    );

if(files.length) {
    previous = files.pop().file;
}

if(cli.flags.wait) {
    return next();
}

capture();
