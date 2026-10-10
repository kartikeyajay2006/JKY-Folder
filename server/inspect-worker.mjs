import { readFileSync } from 'node:fs';
import sharp from 'sharp';
async function inspect(path){
 const bytes=readFileSync(path);
 if(bytes.subarray(0,5).toString()==='%PDF-'){
  const {getDocument}=await import('pdfjs-dist/legacy/build/pdf.mjs');
  const loading=getDocument({data:new Uint8Array(bytes),isEvalSupported:false,useSystemFonts:false,disableFontFace:true,stopAtErrors:true,verbosity:0});
  const pdf=await loading.promise;
  try{
   if(pdf.numPages>20)throw Error('This development release supports up to 20 pages per file.');
   const pages=[];
   for(let n=1;n<=pdf.numPages;n++){
    const page=await pdf.getPage(n);const content=await page.getTextContent();
    let text='';for(const item of content.items){if('str' in item)text+=item.str+' ';if(text.length>18000)break;}
    pages.push({number:n,text:text.slice(0,18000).trim()});page.cleanup();
   }
   return {mime:'application/pdf',pageCount:pdf.numPages,pages};
  }finally{await loading.destroy();}
 }
 if(!(bytes[0]===255&&bytes[1]===216&&bytes[2]===255))throw Error('Only actual PDF or JPEG files are supported. Renaming a file does not convert it.');
 const image=sharp(bytes,{limitInputPixels:20_000_000,failOn:'warning'});const metadata=await image.metadata();
 if(metadata.format!=='jpeg'||!metadata.width||!metadata.height)throw Error('The JPEG image could not be inspected.');
 await image.resize({width:32,height:32,fit:'inside'}).raw().toBuffer();
 return {mime:'image/jpeg',pageCount:1,pages:[{number:1,text:''}],width:metadata.width,height:metadata.height};
}
inspect(process.argv[2]).then(result=>process.send?.({ok:true,result})).catch(error=>process.send?.({ok:false,error:error?.name==='PasswordException'?'Password-protected PDFs are unsupported. Upload an unlocked copy if permitted.':String(error.message).slice(0,240)})).finally(()=>process.disconnect?.());
