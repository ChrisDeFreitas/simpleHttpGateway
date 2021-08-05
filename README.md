# simpleHttpGateway

I am warehousing a bare bones http server.  I use it whenever I need to build out custom server functionality.  I was using https://hapi.dev, but it was overkill for all the projects I worked on.  So I put this server together looking at the bare functionality needed to serve http requests, while allowing for extended functionality via expressjs (and its plugin ecosystem).

Will be adding features overtime.  But feel free to use as you see fit.



0. Overview
- built with https://expressjs.com
- quickly define endpoints
- simple to customize server functionality 
- defautls to port 3000, change in [server.js](server.js)
- perfect for quick development projects
- production should run behind a reverse proxy, firewall, or load balancer

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
- on startup ./endpoints is scanned for Javascript files exporting an "endpoints" array.
- see [endpoints/test.js](endpoints/test.js) for a sample file
- minimum structure object in the array:
```javascript
{
  path:'',      //required
  // defines endpoint addres, for example: 127.0.0.1/[path property value]
  
  argmap:{}, //not required, see test.js/test4 for example usage
  ver:'',    //not required
  notes:'',  //not required

  init(app){},  //not required

  exec(req, res){},  //required
  // function called when endpoint requested
  // handle as any express request
  // arguments are the expressjs request and response objects
}
```

- sample plugin format from [endpoints/test.js](endpoints/test.js):
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

4. configure
- edit epress.js settings in server.js
- inject a custom handler in the plugin pipeline
