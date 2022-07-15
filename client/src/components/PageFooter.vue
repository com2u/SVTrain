<template>
  <footer class="page-footer">
    <div class="logo">
      <img src="../assets/footer.png" alt="footer">
    </div>
    <div>&copy; Körber Pharma Inspection GmbH. All rights reserved.</div>
  </footer>
</template>
<script></script>
<style lang="scss" scoped>
  .page-footer {
    background: #111;
    width: 100%;
    height: 50px;
    line-height: 50px;
    display: flex;
    color: #fff;
    justify-content: space-between;
    padding: 0 30px;

    .logo {
      height: 50px;
      text-transform: uppercase;
      img {
        flex: none;
        max-height: 80%;
        width: auto;
      }
    }
  }
</style>
