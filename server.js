const title = 'Simple HTTP Gateway'
const version = '0.0.0'
const options = {
  port: { default: 3000, notes:'listening port'},
  'case sensitive routing': {default:false, notes:'https://expressjs.com/en/4x/api.html#app.set'},
  env: { default:'development', 
    notes:'https://expressjs.com/advanced/best-practice-performance.html#env',
    range:['development','production'] 
  },
  baseDir: __dirname,
  endpointDir: __dirname +'/endpoints', 
  'query parser':{default:'extended', notes:'http://expressjs.com/en/4x/api.html#app.settings.table'},
  'trust proxy':{default:false, notes:'http://expressjs.com/en/4x/api.html#app.settings.table'},
}

console.log( title, version)
function log( ...str ){
  console.log( '  ', ...str )
}

console.log("Options:")
for( optName in options ){
  let opt = options[optName]
  if( typeof opt == 'string' || typeof opt == 'number')
    log( optName +':', opt )
  else
    log( optName +':', opt.default, ' // ' +opt.notes )
}


const express = require('express')
const app = express()
app.locals.title = title +' v' +version
app.locals.log = log
app.locals.options = options
app.locals.rcnt = 0    //request counter
app.locals.verifyArgs = verifyArgs

app.set('case sensitive routing', options['case sensitive routing'].default)
app.set('env', options.env.default)
app.set('case sensitive routing', options['query parser'].default)
app.set('case sensitive routing', options['trust proxy'].default)

app.use(function (req, res, next) {  // called before each request handled
  if(!req || !res) return   //is it for us?

  res.locals.timestamp = (new Date()).toJSON()
  app.locals.rcnt++
  
  console.log('request #' +app.locals.rcnt, req.path, res.locals.timestamp)
  log('ip:', req.ip)
  log('query:', req.query)
  next()
})
/*app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})*/


//endpoint list with default endpoints
const endpoints = [
  { path:'/test2', 
    ver:'0.0.0',
    notes:'test2 endpoint defined in server.js/endpoints[]',
    args:{},
    init( app ){ // app, options are global
      log( this.path +' init done.')
    },
    exec( req, res ){
      log( this.path +'exec()...')
      res.send(this.notes)
    }
  },
]

try {
  console.log('Endpoints')

  //read endpoints folder
  const fs = require('fs')
  fs.readdirSync(options.endpointDir)
  .map(fileName => {
    let fn = options.endpointDir +'/' +fileName
    let list = require( fn ).endpoints
    log( 'reading:', fn ) 
    list.map( endpoint => {
      log( '  loading:', endpoint.path ) 
      endpoints.push( endpoint )
    })
    //log( 'list', list )
  })  

  log( 'init:' ) 
  let ii = 0
  for(let endpoint of endpoints){
    log( (++ii)+'.', endpoint.path, endpoint.ver, ' // ' +endpoint.notes )
    endpoint.init( app )  //expect: exception on error
    app.get( endpoint.path, (req, res) => {
      verifyArgs( req, res, endpoint )    //set: res.locals.args, res.locals.vresult 
      endpoint.exec(req, res)
    })
  }
}
catch( err ){
  log('\nEndpoint error caught:')
  log( err )
  process.exit( 1 )
}

app.get('/', (req, res)=>{
  res.send('Hello Root')
})
app.get('/test1', (req, res)=>{
  res.send('/test1: Path defined in server.js')
})
app.listen( options.port.default )


function verifyArgs( req, res, api ){
  let args = {},
    vresult = testArgs(args, req.query, api.argmap)
  res.locals.args = args
  res.locals.vresult = vresult
  log('Arg validation:', vresult)

  if(vresult.missing != '' || vresult.invalid !== ''){
    throw `${api.path} data validation error:`+ JSON.stringify(vresult, null, '  ') 
  }
}

// misc functions
function testArgs(args, clientargs, apiargs) {
  let missing='', invalid=''

  function local_testval(key,val,typ,required,def){
    if(val===null){
      if(def !== undefined)
        val = def
      else
      if(required===true){
        missing += key+', '  //missing required arg
        return null
      }
    }

    if(typ==='string' && val==='' && required===true){
      invalid += key+'(empty string), '
    }else
    if(typ.indexOf('date') >= 0){
      let dt = new Date(val)
      if( dt.toString()==='Invalid Date'){
        invalid += key+'(bad date), '
        return null
      }
    }else
    if(apiargs[key].range !== undefined){
      if(apiargs[key].range.indexOf(val) < 0){
        invalid += key+'(value not in range), '
        return null
      }
    }

    return typeConvert(val, typ, def)
  }

  //test for api.argmap.key
  for(let key in apiargs){
    let argmap = apiargs[key],
      def = argmap.default,
      typ = argmap.type,
      required = ( argmap.required, argmap.required, false),
      val = clientargs[key]
    
    if(typ == undefined){    //handle cases:  key='xxx', key=true, key=1
      typ = typeof argmap
      def = argmap
      required = false
    }

    if(val===undefined){    
      if(def != undefined)
        args[key] = def    //use: api.argmap[key].default
      else
      if(required===true)
        missing += key+', '  //missing required arg
    }
    else  //test value
      args[key] = local_testval(key, val, typ, required, def)
  }

  if(missing != '')
    missing = missing.substr(0, missing.length-2)
  if(invalid != '')
    invalid = invalid.substr(0, invalid.length-2)

  return {missing:missing,invalid:invalid}
}
function typeConvert(val, type, def){
  switch(type){
  case 'string':   return val
  case 'number':
  case 'int':
  case 'integer':
  case 'float':  {
    if(val[0] == "'" || val[0] == '"' )
      val = val.substring(1)
    if(val[val.length -1] == "'" || val[val.length -1] == '"' )
      val = val.slice(0, val.length -1)
    if(val == '' || val === 'null'){
      if(def != null)
        return def  //default value for argmap
      else
        return null
    }
    if(type == 'int' || type == 'integer')
      return parseInt(val, 10)
    else
      return Number(val)
  }
  case 'bool':
  case 'boolean':
      return toBool(val)
  case 'date':
  case 'datetime':
  {
      return new Date(val)
  }
  case 'array':
  {
      return toArray(val)
  }
  case 'object':
  case 'map':
  case 'json':
    try{
      if(val[0] == "'")  val = val.substring(1).trim()
      if(val[0] == '"')  val = val.substring(1).trim()
      if(val[val.length-1] == "'")  val = val.substring(0, val.length-1).trim()
      if(val[val.length-1] == '"')  val = val.substring(0, val.length-1).trim()
      let obj = JSON.parse(val)
      // log('json val', val, typeof obj, obj)
      return obj
    }
    catch(error) {
      //err(error)
      throw 'typeConvert() error converting JSON for: ['+val+']: '+error
    }
  }
  return arg
}
function toBool(arg){
  return (
      arg === true
  || arg === 1
  || arg === 'true'
  || arg === '1'
  || arg === 'yes'
  )
}
function toArray(str){  //str = 'string' || 'string1, string2'  || 'string1,string2'
  if(str==null)  return []
  if(Array.isArray(str)) return str
  if(typeof str != 'string') return [str]

  let arr = null
  if(str.indexOf(', ') >= 0){
    arr = str.split(', ')
  } else
  if(str.indexOf(',') >= 0){
    arr = str.split(',')
  } else
    arr = [str]

  if(arr[0]=='') arr.splice(0,1)
  if(arr[arr.length-1]=='') arr.splice(arr.length-1,1)

  return arr
}
