"use strict";

const express = require('express');
const app = express();
const request = require('request');

// All routes
var router = require('./routing')

app.use(router)

console.log('ready!')

// Bind to all ip addresses so I can reach it on my virtual machine
app.listen(1200, '0.0.0.0');