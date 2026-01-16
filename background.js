const bannerText = document.getElementById('banner-text');
const smallMax = 8;
const largeMax = 16;
const radius = 32;
const backgroundMax = 32;
const degrees = 4;

function moveShadow(x, y) {
   const largeToSmallRatio = largeMax / smallMax;
   const backgroundToLargeRatio = backgroundMax / largeMax;
   const clampedX = Math.max(Math.min(x, largeMax), -largeMax);
   const clampedY = Math.max(Math.min(y, largeMax), -largeMax);
   bannerText.style.setProperty('text-shadow', `${clampedX / largeToSmallRatio}px ${clampedY / largeToSmallRatio}px 0px var(--color-pink),${clampedX}px ${clampedY}px 0px var(--color-red)`);
   document.body.style.setProperty('--bg-pos', `${-clampedX * backgroundToLargeRatio}px ${-clampedY * backgroundToLargeRatio}px`)
}

addEventListener('mousemove', e => {
   const { pageX, pageY } = e;
   const boundingRect = bannerText.getBoundingClientRect();
   const middleX = boundingRect.right - (boundingRect.width / 2);
   const middleY = boundingRect.bottom - (boundingRect.height / 2);

   const shadowX = (middleX - pageX) / radius;
   const shadowY = (middleY - pageY) / radius;
   moveShadow(shadowX, shadowY);
});

addEventListener("deviceorientation", e => {
   const { beta, gamma } = e;
   if (beta === null || gamma === null) return;

   const y = (beta) / degrees;
   const x = ((beta > 90 ? -1 : 1) * gamma) / degrees;

   moveShadow(-x, -y);
});