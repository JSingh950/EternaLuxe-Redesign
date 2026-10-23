import sharp from 'sharp';

// Project a frontal panel onto a wall with vertical sides and converging edges.
// Unlike a shear, both horizontal edges follow the room's vanishing point.
export async function projectWall(input,{
 width=1774,height=887,left=132,right=570,
 topLeft=94,topRight=123,bottomLeft=400,bottomRight=393,source=null
}={}){
 const {data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const output=Buffer.alloc(width*height*4);
 for(let x=Math.floor(left);x<Math.ceil(right);x++){
  const u=(x+.5-left)/(right-left);
  const top=topLeft+(topRight-topLeft)*u;
  const bottom=bottomLeft+(bottomRight-bottomLeft)*u;
  for(let y=Math.floor(top);y<Math.ceil(bottom);y++){
   const v=(y+.5-top)/(bottom-top);
   if(u<0||u>1||v<0||v>1||x<0||x>=width||y<0||y>=height)continue;
   const sx=source?source.left+u*(source.right-source.left):u*(info.width-1);
   const sy=source?(source.topLeft+(source.topRight-source.topLeft)*u)*(1-v)+(source.bottomLeft+(source.bottomRight-source.bottomLeft)*u)*v:v*(info.height-1);
   const x0=Math.floor(sx),y0=Math.floor(sy),fx=sx-x0,fy=sy-y0;
   let alpha=0;const rgb=[0,0,0];
   for(const [dx,dy,weight] of [[0,0,(1-fx)*(1-fy)],[1,0,fx*(1-fy)],[0,1,(1-fx)*fy],[1,1,fx*fy]]){
    const i=(Math.min(y0+dy,info.height-1)*info.width+Math.min(x0+dx,info.width-1))*4;
    const a=data[i+3]/255*weight;alpha+=a;
    for(let c=0;c<3;c++)rgb[c]+=data[i+c]*a;
   }
   const dest=(y*width+x)*4;
   if(alpha>0)for(let c=0;c<3;c++)output[dest+c]=Math.round(rgb[c]/alpha);
   output[dest+3]=Math.round(alpha*255);
  }
 }
 return sharp(output,{raw:{width,height,channels:4}}).png().toBuffer();
}
