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
    `, {
        alias : {
            time  : "t",
            dir  : "d",
            wait  : "w",
            level : "l"
        },

        default : {
            time  : "30s",
            dir   : "./snaps",
            wait  : "5s",
            level : "info"
        }
    }),
    
    pageres = new Pageres({
        filename : "<%= date %> - <%= time %>"
    }),
    
    previous;

log.level = cli.flags.level;

if(!cli.input.length) {
    log.error("You must specify a site to capture");

    process.exit(1);
}

log.verbose(`Saving shots to: ${cli.flags.dir}`);

pageres
    .src(cli.input[0], [ "1366x768" ])
    .dest(path.resolve(cli.flags.dir));

function capture() {
    log.http(`Capturing ${cli.input[0]}`);

    pageres.run().then((args) => {
        var current = path.resolve(cli.flags.dir, args[0].filename);
        
        log.info(`Captured`);

        if(previous && fs.readFileSync(previous).equals(fs.readFileSync(current))) {
            log.warn("Duplicate capture, discarding");
            
            // TODO: Not working
            fs.unlinkSync(current);
        }
        
        previous = current;

        return setTimeout(capture, ms(cli.flags.wait));
    });
}

if(cli.flags.wait) {
    return setTimeout(capture, ms(cli.flags.wait));
}

capture();
