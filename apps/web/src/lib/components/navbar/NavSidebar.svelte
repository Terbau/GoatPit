<script lang="ts">
  import SidebarLink from "./SidebarLink.svelte";
</script>

<div class="absolute w-[20rem] bg-slate-8 h-screen z-30">
  <ul>
    <li>
      <SidebarLink href="/">Home</SidebarLink>
    </li>
    <li>
      <SidebarLink href="/autorank">AutoRank <span class="badge badge-info badge-md">NEW</span></SidebarLink>
    </li>
    <li>
      <SidebarLink href="/">Discover</SidebarLink>
    </li>
    <!-- <li>
      <Link href="/">Info</Link>
    </li> -->
  </ul>
</div>