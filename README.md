# BI Web Application Server

## What? 

This is the basic web application server used for web projects at Bisnode Informatics. It is basically a "sugar module", that enables developers to get a typical system with only a few keystrokes, and that can be easily used locally for development or deployed to QA or production environments. 

## Contents 

The bi-appsrvr includes: 

   * an HTTP server
   * an HTTPS server
   * a Websocket server
   * a simple routing engine
   * application modules that can be hooked into routes

All of these features can be enabled independently from each other and are easily configurable. 

The HTTP/HTTPS servers are based on the excellent connect framework and come with: 

   * cookie support
   * session support
   * a query and request body parser
   * CSRF (cross-site request forgery) protection
   * an authentication module

Websockets are implemented using socket.io, servers listen to their HTTP/S server ports.

## Install

npm install bi-appsrvr

## Develop

w00t? Yay! \o/