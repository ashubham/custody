'use strict';

var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;
var fs = require('fs');
var glob = require('glob');
var gulp = require('gulp');
var eslint = require('gulp-eslint');
var gzip = require('gulp-gzip');
var tar = require('gulp-tar');
var tslint = require('gulp-tslint');
var path = require('path');
var runSequence = require('run-sequence');
var semver = require('semver');

var runSpawn = function (done, task, optArg, optIo) {
    optArg = typeof optArg !== 'undefined' ? optArg : [];
    var stdio = 'inherit';
    if (optIo === 'ignore') {
        stdio = 'ignore';
    }
    var child = spawn(task, optArg, { stdio: stdio });
    var running = false;
    child.on('close', function () {
        if (!running) {
            running = true;
            done();
        }
    });
    child.on('error', function () {
        if (!running) {
            console.error('gulp encountered a child error');
            running = true;
            done();
        }
    });
};

gulp.task('tslint', function () {
    return gulp.src(['lib/**/*.ts', 'spec/**/*.ts'])
        .pipe(tslint())
        .pipe(tslint.report());
});

gulp.task('lint', function (done) {
    runSequence('tslint', 'eslint', done);
});

gulp.task('built:copy', function (done) {
    return gulp.src(['lib/**/*.js'])
        .pipe(gulp.dest('built/'));
    done();
});

gulp.task('eslint', function (done) {
    return gulp.src(['**/*.js', '!node_modules/**', '!built/**',
        '!_docpress/**', '!gulpfile.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('tsc', function (done) {
    runSpawn(done, 'node', ['node_modules/typescript/bin/tsc']);
});

gulp.task('compile_to_es5', function (done) {
    runSequence('tsc:es5', 'built:copy', done);
});

gulp.task('build', function (done) {
    runSequence( 'lint', 'tsc', 'built:copy', done);
});

gulp.task('dist', function () {
    gulp.src([
        'bin/**',
        'built/**',
        'examples/**',
        'package.json',
        'LICENSE'
    ], { base: '..' })
        .pipe(tar('release.tar'))
        .pipe(gzip())
        .pipe(gulp.dest('dist/'));
});

gulp.task('prepublish', function (done) {
    runSequence('build', 'dist', done);
});

gulp.task('default', ['build']);
