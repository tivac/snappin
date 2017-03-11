#!/usr/bin/env node
"use strict";

var fs   = require("fs"),
    path = require("path"),

    log  = require("npmlog"),
    same = require("looks-same"),
    shot = require("electron-screenshot-service"),
    
    files, previous;

module.exports = function(url, options) {
    log.level = options.level || "info";

    log.verbose(`Saving shots to: ${options.dir}`);
    
    console.log(options);

    function capture() {
        log.http(`Capturing ${url}`);

        shot({
            url    : url,
            width  : options.res.split("x")[0],
            height : options.res.split("x")[1],
            delay  : options.delay || 0,
            page   : true
        })
        .then((img) => {
            var file    = `${Date.now()}.png`,
                current = path.join(options.dir, file);
            
            fs.writeFileSync(current, img.data);

            if(!previous) {
                log.info(`Captured ${file}`);

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
                        log.info(`Captured ${file}`);

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
        return setTimeout(capture, options.time);
    }

    // Attempt to determine most recent file to use for comparisons
    if(fs.existsSync(options.dir)) {
        files = fs.readdirSync(options.dir)
            .map((file) => {
                file = path.join(options.dir, file);
                
                return {
                    file,
                    time : fs.statSync(file).mtime
                };
            })
            .sort((a, b) =>
                a.time - b.time
            );

        previous = files.pop().file;
    }

    if(options.wait) {
        log.info("Waiting...");

        return setTimeout(capture, options.wait);
    }

    capture();
};

// Clean up
process.on("exit", () => shot.close());
