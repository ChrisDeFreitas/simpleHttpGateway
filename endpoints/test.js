module.exports.endpoints = [
  { path:"/test3", 
    ver:'0.0.0',
    notes:'test3 defined in endpoints/test.js',
    argmap:{},
    init( app ){ // app, options are global
      const log = app.locals.log
      log( this.path +' init done.')
    },
    exec( req, res ){
      const log = req.app.locals.log
      log( this.path +'.exec()...' )
      res.send(this.notes)
    }
  },
  { path:"/test4",
    ver:'0.0.0',
    notes:'test4 handle arguments',
    argmap:{
      folders:{type:'string', default:'first', range:['default','first','hidden','last'], alias:['--folders'] },
      height:{type:'number', default:0, notes:'default window height; 0 = max height', alias:['--height'] },
      scroll:{type:'boolean', default:false,  notes:"turn on/off scrolling grid whenever items loaded.", alias:['--scroll'] },
      shuffle:{type:'boolean',  default:false,  notes:"shuffle grid items via arrShuffle()", alias:['--shuffle'] },
    },
    init( app ){ // app, options are global
      const log = app.locals.log
      log( this.path +' init done.')
    },
    exec( req, res ){
      const log = req.app.locals.log
      log( this.path +'.exec()...' )
      
      // req.app.locals.verifyArgs( req, res, this )  //set: res.locals.args, res.locals.vresult 
      res.json( res.locals.args )
    }
  }
]  