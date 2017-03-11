#!/usr/bin/env node
"use strict";

var path = require("path"),
    
    ms  = require("humanize-ms"),
    log = require("npmlog"),
    cli = require("meow")(`
        Usage
            $ snappin --time 30s localhost:3000
        
        Options
            --time,  -t  Interval between captures (30s)
            --dir,   -d  Directory to save captures to (./snaps)
            --wait,  -w  Wait to take initial snap (5s)
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

    snappin = require("./index.js");

if(!cli.input.length) {
    log.error("You must specify a site to capture");

    return cli.showHelp(1);
}

// Convert some cli args where it makes sense
cli.flags.dir   = path.resolve(cli.flags.dir);
cli.flags.wait  = ms(cli.flags.wait);
cli.flags.time  = ms(cli.flags.time);
cli.flags.delay = Math.floor(ms(cli.flags.delay) / 1000);

snappin(cli.input[0], cli.flags);
