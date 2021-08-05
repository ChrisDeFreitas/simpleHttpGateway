# simpleHttpGateway

I am warehousing a bare bones http server.  I use it whenever I need to build out custom server functionality.  I was using https://hapi.dev, but it was overkill for all the projects I worked on.  So I put this server together looking at the bare functionality needed to serve http requests, while allowing for extended functionality via expressjs (and its plugin ecosystem).

Will be adding features overtime.  But feel free to use as you see fit.

0. Overview
- built with https://expressjs.com
- quickly define Express Middleware Endpoints
- automatic http arg cleaning, see [server.js/verifyArgs()](server.js)
- defaults to port 3000, change in [server.js](server.js)
- simple to modify [Express API](https://expressjs.com/en/4x/api.html)
- monitor endpoint handling via stdout
- log to stdout via console.log or format with req.app.locals.log(...args)
- perfect for quick development projects
- production should run behind a reverse proxy, firewall, or load balancer
- suitable for running as Linux service via init script

1. Install
```BASH
$ git clone https://github.com/ChrisDeFreitas/simpleHttpGateway gateway
$ cd gateway
$ npm install
```

2. Run
```BASH
$ npm start
```

3. Endpoint plugins
- on startup ./endpoints/ is scanned for .js files exporting an "endpoints" array.
- see [endpoints/test.js](endpoints/test.js) for a sample file
- see [Express Middleware Function Definition](https://expressjs.com/en/4x/api.html#app.get.method)
- minimum structure for endpoints in  array:
```javascript
{
  path:'',      //required
  // defines endpoint address/URI, for example: 127.0.0.1/[path property value]
  // see https://expressjs.com/en/4x/api.html#path-examples
  
  argmap:{}, //not required, see test.js/test4 for example usage
  ver:'',    //not required
  notes:'',  //not required

  init(app){},  //not required

  exec(req, res){},  //required
  // function called when endpoint requested
  // arguments are request and response objects
  // handle as any express middleware request, see:
  //   https://expressjs.com/en/4x/api.html#app.get.method
}
```

- sample plugin from [endpoints/test.js](endpoints/test.js):
```javascript
module.exports.endpoints = [
  { path:"/test3", 
    ver:'0.0.0',
    notes:'test3 defined in endpoints/test.js',
    argmap:{},
    init( app ){ // app, options are global
      const log = app.locals.log
      log(this.path +' init done.')
    },
    exec( req, res ){
      const log = req.app.locals.log
      log(this.path +'.exec()...')
      res.send(this.notes)
    }
  },
]
```

4. Test
- default endpoints:  
  http://127.0.0.1:3000  
  http://127.0.0.1:3000/test1  
  http://127.0.0.1:3000/test2  
  http://127.0.0.1:3000/test3  
  http://127.0.0.1:3000/test4  
  http://127.0.0.1:3000/test4?scroll=true  
  http://127.0.0.1:3000/test4?scroll=true&height=123  
