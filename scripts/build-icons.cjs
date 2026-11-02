// Asset preparation only: resize the approved illustration without redrawing it.
// Run explicitly after changing design/wordward-icon-master.png; normal deployment
// copies the checked-in PNGs and does not require a browser or image dependencies.
const {readFileSync,writeFileSync}=require('node:fs');
const {resolve}=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/opt/codex/cua_node/lib/node_modules/playwright-core');
(async()=>{
 const root=resolve(__dirname,'..'),source=readFileSync(resolve(root,'design/wordward-icon-master.png')).toString('base64');
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{const page=await browser.newPage();
  for(const[name,size]of[['icon-64.png',64],['apple-touch-icon.png',180],['icon-192.png',192],['icon-512.png',512]]){
   const png=await page.evaluate(async({source,size})=>{const image=new Image();image.src='data:image/png;base64,'+source;await image.decode();const canvas=document.createElement('canvas');canvas.width=canvas.height=size;const ctx=canvas.getContext('2d',{alpha:false});ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(image,0,0,size,size);return canvas.toDataURL('image/png').split(',')[1];},{source,size});
   writeFileSync(resolve(root,'dist',name),Buffer.from(png,'base64'));console.log(`${name}: ${size}×${size}`);
  }
  // Raster-backed compatibility SVG for existing icon.svg bookmarks. No external
  // images or font dependence; the favicon and PWA use the dedicated PNGs.
  const embedded=readFileSync(resolve(root,'dist/icon-192.png')).toString('base64');
  writeFileSync(resolve(root,'dist/icon.svg'),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><title>字阵 · 偏旁成字，落字成阵</title><image width="512" height="512" href="data:image/png;base64,${embedded}"/></svg>\n`);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
