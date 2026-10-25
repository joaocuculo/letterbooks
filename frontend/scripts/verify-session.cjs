const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const axios = require('axios');
const root = require('node:path').resolve(__dirname, '../src');
let stored = null;
const storage = {getToken:()=>stored,removeToken:()=>{stored=null;}};
const window = new EventTarget();
function load(file, imports, extra = {}) {
 const source = fs.readFileSync(root+'/'+file,'utf8').replace('import.meta.env.VITE_API_URL',JSON.stringify('http://test'));
 const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS, jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const exports={};
 vm.runInNewContext(output,{exports,require:id=>imports[id],window,Event,atob,Date,console,...extra});
 return exports;
}
const session=load('utils/session.ts',{'./authStorage':storage});
const {api}=load('services/api.ts',{'axios':axios,'../utils/authStorage':storage,'../utils/session':session});
const jwt=seconds=>'header.'+Buffer.from(JSON.stringify({exp:Math.floor(Date.now()/1000)+seconds})).toString('base64url')+'.signature';
let notices=0;
window.addEventListener(session.SESSION_EXPIRED,()=>notices++);
function adapter(status) {
 return config=>Promise.reject(new axios.AxiosError('Rejected','ERR_BAD_RESPONSE',config,null,{status,data:{},headers:{},config}));
}
test('expired or malformed credentials expire once and never reach the adapter',async()=>{
 for(const token of [jwt(-1),'invalid']) {
 stored=token; const before=notices;
 await assert.rejects(api.get('/ratings',{adapter:()=>{throw Error('Must not send');}}),e=>e.code===session.SESSION_ERROR_CODE);
 assert.equal(stored,null); assert.equal(notices,before+1);
 session.expireSession(token); assert.equal(notices,before+1);
 }
});
test('authenticated 401 expires session; anonymous/login errors do not',async()=>{
 stored=jwt(100);
 await assert.rejects(api.get('/ratings',{adapter:adapter(401)})); assert.equal(stored,null);
 const before=notices;
 await assert.rejects(api.get('/ratings',{adapter:adapter(401)})); assert.equal(notices,before);
 stored=jwt(100);const token=stored;
 await assert.rejects(api.post('/auth/login',{}, {adapter:adapter(401)}));assert.equal(stored,token);
});
test('403, 500 and connection failures keep the session',async()=>{
 stored=jwt(100);const token=stored;
 for(const status of [403,500]) {await assert.rejects(api.get('/ratings',{adapter:adapter(status)}));assert.equal(stored,token);}
 await assert.rejects(api.get('/ratings',{adapter:config=>Promise.reject(new axios.AxiosError('Offline','ERR_NETWORK',config))}));
 assert.equal(stored,token);
});
test('late 401 from an older token cannot terminate a new login',async()=>{
 stored=jwt(100); const newer=jwt(200);
 await assert.rejects(api.get('/ratings',{adapter:config=>{stored=newer;return adapter(401)(config);}}));
 assert.equal(stored,newer);
});

test('provider clears authentication at expiry and when a suspended tab resumes',()=>{
 for (const resume of [false,true]) {
 stored=jwt(100);
 let now=Date.now(); const effects=[],states=[],timers=new Map();let next=0;
 const react={useEffect:fn=>effects.push(fn),useState:initial=>{const index=states.length;states.push(typeof initial==='function'?initial():initial);return [states[index],value=>{states[index]=value;}];}};
 const document=new EventTarget();const messages=[];
 const {AuthProvider}=load('contexts/AuthProvider.tsx',{
 'axios':axios,'react':react,'react/jsx-runtime':{jsx:()=>null},
 '../services/userService':{findMe:()=>new Promise(()=>{})},
 '../utils/getApiErrorMessage.':{getApiErrorMessage:()=>''},
 '../utils/authStorage':{...storage,saveToken:value=>{stored=value;}},
 './AuthContext':{AuthContext:{}},'../utils/session':session,
 '../components/ui/toast-manager':{toast:{add:message=>messages.push(message)}}
 },{document,AbortController,Date:{now:()=>now},setTimeout:fn=>{timers.set(++next,fn);return next;},clearTimeout:id=>timers.delete(id)});
 AuthProvider({children:null});const cleanup=effects.map(fn=>fn());
 const first=[...timers.values()][0];first();
 now+=110000;
 if(resume)window.dispatchEvent(new Event('focus'));
 else [...timers.values()].at(-1)();
 assert.equal(stored,null);assert.equal(states[0],null);assert.equal(states[1],null);
 assert.equal(messages.length,1);
 cleanup.forEach(fn=>fn?.());
 }
});
test('protected redirect preserves pathname, query and hash for login return',()=>{
 const location={pathname:'/my-books',search:'?view=shelves',hash:'#favorites'};
 const {default:ProtectedRoute}=load('components/ProtectedRoute.tsx',{
 'react-router-dom':{useLocation:()=>location,Navigate:'Navigate',Outlet:'Outlet'},
 '../hooks/useAuth':{useAuth:()=>({isAuthenticated:false})},
 'react/jsx-runtime':{jsx:(type,props)=>({type,props})}
 });
 const result=ProtectedRoute();assert.equal(result.props.to,'/login');
 assert.equal(result.props.state.from,'/my-books?view=shelves#favorites');
});
