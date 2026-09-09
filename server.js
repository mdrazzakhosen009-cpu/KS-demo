import express from 'express';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import pg from 'pg';
const __filename=fileURLToPath(import.meta.url),__dirname=path.dirname(__filename),app=express(),PORT=process.env.PORT||10000,ADMIN_PASSWORD=process.env.ADMIN_PASSWORD||'admin12345';
app.use(express.json({limit:'2mb'}));app.use(express.static(path.join(__dirname,'public')));
const products=[
{id:1,name:'Rainbow Dream Dress',category:'Girls Fashion',price:1290,oldPrice:1590,rating:4.9,reviews:96,stock:18,image:'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=85'},
{id:2,name:'Little Explorer Set',category:'Boys Fashion',price:1450,oldPrice:1790,rating:4.8,reviews:72,stock:14,image:'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=900&q=85'},
{id:3,name:'Cloudy Bunny Plush',category:'Toys',price:980,oldPrice:1190,rating:4.9,reviews:138,stock:25,image:'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=900&q=85'},
{id:4,name:'Tiny Steps Sneakers',category:'Shoes',price:1650,oldPrice:1950,rating:4.7,reviews:64,stock:20,image:'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=900&q=85'},
{id:5,name:'Pastel Star Backpack',category:'Accessories',price:1190,oldPrice:1490,rating:4.8,reviews:58,stock:17,image:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85'},
{id:6,name:'Mini Artist Color Set',category:'Learning & Fun',price:690,oldPrice:850,rating:4.8,reviews:43,stock:30,image:'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=900&q=85'}
];
let reviews=[{id:1,name:'Mim Rahman',rating:5,text:'Website-ta khub beautiful. Product as expected, packaging-o cute chilo!',product:'Rainbow Dream Dress',verified:true},{id:2,name:'Sadia Akter',rating:5,text:'Toys er quality excellent. Baby onek happy hoyeche.',product:'Cloudy Bunny Plush',verified:true},{id:3,name:'Nusrat Jahan',rating:4.9,text:'Delivery fast chilo and customer support really helpful.',product:'Pastel Star Backpack',verified:true},{id:4,name:'Rafia Islam',rating:5,text:'Gift order korechilam. Packaging dekhei premium feel peyechi.',product:'Little Explorer Set',verified:true}],orders=[];
const settings={whatsapp:'+8800000000000',delivery:'সারা বাংলাদেশে 2–5 কর্মদিবস'};
let pool=null;if(process.env.DATABASE_URL)pool=new pg.Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});
async function init(){if(!pool)return;await pool.query('CREATE TABLE IF NOT EXISTS products(id serial primary key,name text,category text,price numeric,old_price numeric,rating numeric,reviews int,stock int,image text);CREATE TABLE IF NOT EXISTS reviews(id serial primary key,name text,rating numeric,text text,product text,verified boolean default false,created_at timestamp default now());CREATE TABLE IF NOT EXISTS orders(id serial primary key,order_no text unique,customer jsonb,items jsonb,total numeric,status text default \'Pending\',created_at timestamp default now());');}
function auth(req,res,next){if(req.headers['x-admin-password']!==ADMIN_PASSWORD)return res.status(401).json({error:'Unauthorized'});next()}
app.get('/api/products',(q,res)=>res.json(products));app.get('/api/reviews',(q,res)=>res.json(reviews));app.get('/api/settings',(q,res)=>res.json(settings));
app.post('/api/reviews',(req,res)=>{const {name,rating,text,product}=req.body;if(!name||!rating||!text)return res.status(400).json({error:'Required fields missing'});const r={id:Date.now(),name,rating:Number(rating),text,product:product||'',verified:false};reviews.unshift(r);res.json(r)});
app.post('/api/orders',(req,res)=>{const {customer,items,total,payment}=req.body;if(!customer?.name||!customer?.phone||!customer?.address||!items?.length)return res.status(400).json({error:'Missing customer details'});const orderNo='KS'+Date.now().toString().slice(-8);orders.unshift({orderNo,customer,items,total,payment,status:'Pending'});res.json({orderNo,status:'Pending'})});
app.get('/api/orders/:no',(req,res)=>{const o=orders.find(x=>x.orderNo===req.params.no);o?res.json(o):res.status(404).json({error:'Order not found'})});app.post('/api/admin/login',(req,res)=>res.json({ok:req.body.password===ADMIN_PASSWORD}));
app.get('/api/admin/orders',auth,(q,res)=>res.json(orders));app.patch('/api/admin/orders/:no',auth,(req,res)=>{const o=orders.find(x=>x.orderNo===req.params.no);if(!o)return res.status(404).json({error:'Not found'});o.status=req.body.status;res.json(o)});app.delete('/api/reviews/:id',auth,(req,res)=>{reviews=reviews.filter(x=>x.id!==Number(req.params.id));res.json({ok:true})});
app.use((req,res,next)=>req.method==='GET'&&!req.path.startsWith('/api/')?res.sendFile(path.join(__dirname,'public','index.html')):next());app.use((req,res)=>res.status(404).json({error:'Not found'}));init().catch(console.error);app.listen(PORT,()=>console.log('KiDDY SHOP running on '+PORT));
