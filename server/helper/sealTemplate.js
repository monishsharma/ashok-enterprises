export const sealTemplate = ({ sealText, city }) => `


<div class="circle-wrapper">
  <svg viewBox="0 0 300 300">
    <circle cx="150" cy="150" r="90" class="outer-circle" />
    <circle cx="150" cy="150" r="55" class="inner-circle" />

    <defs>
      <path
        id="text-circle"
        d="M 150,150 m -70,0 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0"
      />
    </defs>

    <text class="circle-text">
      <textPath href="#text-circle">${sealText}</textPath>
    </text>

    <text x="150" y="150" class="center-text">${city}</text>
  </svg>
</div>
`;