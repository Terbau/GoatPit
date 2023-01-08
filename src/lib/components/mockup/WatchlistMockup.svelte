<script lang="ts">
	import { transformImdbImageSize } from "$lib/utils";
	import { onDestroy, onMount } from "svelte";

  const items = [
    {
      name: 'Up',
      url: 'https://m.media-amazon.com/images/M/MV5BMTk3NDE2NzI4NF5BMl5BanBnXkFtZTgwNzE1MzEyMTE@._V1_QL75_UX190_CR0,2,190,281_.jpg',
      eloRating: 1200,
      starRating: 8.3,
      yearReleased: 2009,
      genres: ["Animation", "Adventure", "Comedy"],
      plot: "78-year-old Carl Fredricksen travels to Paradise Falls in his house equipped with balloons, inadvertently taking a young stowaway.",
    },
    {
      name: 'Troll',
      url: 'https://m.media-amazon.com/images/M/MV5BOWQzMDc5OTMtMjFiMy00M2I3LWIyZWMtODM4NTRhMGI2ZTRkXkEyXkFqcGdeQXVyNDAxNzcyNw@@._V1_QL75_UX190_CR0,0,190,281_.jpg',
      eloRating: null,
      starRating: 5.8,
      yearReleased: 2022,
      genres: ["Action", "Adventure", "Drama"],
      plot: "Deep in the Dovre mountain, something gigantic wakes up after a thousand years in captivity. The creature destroys everything in its path and quickly approaches Oslo.",
    },
    {
      name: 'Glass Onion',
      url: 'https://m.media-amazon.com/images/M/MV5BYmZlZDZkZjYtNzE5Mi00ODFhLTk2OTgtZWVmODBiZTI4NGFiXkEyXkFqcGdeQXVyMTE5MTg5NDIw._V1_QL75_UX190_CR0,2,190,281_.jpg',
      eloRating: 900,
      starRating: 7.2,
      yearReleased: 2022,
      genres: ["Comedy", "Crime", "Drama"],
      plot: "Famed Southern detective Benoit Blanc travels to Greece for his latest case.",
    },
    {
      name: 'Inception',
      url: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_QL75_UX190_CR0,0,190,281_.jpg',
      eloRating: 1500,
      starRating: 8.7,
      yearReleased: 2010,
      genres: ["Action", "Adventure", "Sci-Fi"],
      plot: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic...",
    },
  ]

  const preloadImages = async (urls: string[]): Promise<void> => {
    await Promise.all(
      urls.map((url) => {
        return new Promise((resolve) => {
          const image = new Image();
          image.src = url;
          image.onload = resolve;
        });
      })
    );
  }

  const preloadAllImages = async () => {
    const urls = items.map((item) => transformImdbImageSize(item.url, 100));
    await preloadImages(urls);
  }

  const run = async () => {
    
  }

  let interval: NodeJS.Timer;

  onMount(() => {
    // interval = setInterval(run, 1000);
  })

  onDestroy(() => {
    // clearInterval(interval);
  })


</script>


<div>
  {#await preloadAllImages()}
    <!-- Loading... -->
  {:then}
    <ul class="list flex flex-col items-center gap-y-4 overflow-y-hidden mt-3">
      <!-- each i in range 8 -->
      {#each Array(items.length*2) as _, i}

      <!-- {#each items as item} -->
        <li
          class="flex justify-center ease-in-out duration-75 w-[70%]"
        >
          <div
            class="flex flex-row h-24 w-full shrink-0 rounded-xl bg-indigo-6"
          >
            <img
              class="h-24 w-16 object-fill shrink-0 rounded-l-xl"
              src={items[i%items.length].url}
              loading="lazy"
              alt=""
            />
            <div class="flex flex-col px-2 py-1 grow box-border text-left h-full">
              <div class="flex flex-row items-center gap-x-1">
                <span class="tooltip">
                  <h2 class="text-indigo-12 text-xs md:text-sm font-bold truncate max-w-[11rem]">
                    {items[i%items.length].name}
                  </h2>
                </span>
                <p class="shrink-0 text-indigo-11 text-[0.5rem] md:text-xs">({items[i%items.length].yearReleased})</p>
                <div class="ml-auto flex flex-row h-full items-center gap-x-2">
                  <div class="mb-auto" data-tip="Elo Rating">
                    <span
                      class="text-[0.5rem] md:text-xs font-bold h-full flex items-center bg-gradient-to-r from-indigo-11 to-blue-11 bg-clip-text text-transparent"
                    >
                      {items[i%items.length].eloRating !== null ? Math.floor(items[i%items.length].eloRating ?? 0) : 'Not rated'}
                    </span>
                  </div>
                  <div class="flex flex-row w-fit h-full fill-yellow-9 gap-x-1" data-tip="IMDb Rating">
                    <span class="text-yellow-9 text-[0.5rem] md:text-xs h-full flex items-start font-bold">{items[i%items.length].starRating.toFixed(1)}</span>
                    <!-- <FilledStarIcon /> -->
                  </div>
                </div>
                <!-- <div class="shrink-0 flex flex-row items-center h-full ml-auto">
                  
                </div> -->
              </div>

              <p class="text-[0.5rem] md:text-xs mt-[-0.25rem]">{items[i%items.length].genres.join(', ')}</p>
              <p class="text-[0.5rem] md:text-xs mt-1">{items[i%items.length].plot}</p>

              <!-- <div class="mt-auto">
                <p class="text-right text-sm">Click to {transformActive ? 'close' : 'view'} options</p>
              </div> -->
            </div>
          </div>
        </li>
      {/each}
    </ul>
  {/await}
</div>


<style>
  @keyframes scrollBottom {
    from {
      transform: translateY(0);
    }

    /* 20% on the way */
    20% {
      /* transform: translateY(-5%); */
    }

    25% {
      /* transform: translateY(-7%); */
    }

    to {
      transform: translateY(-60%);
    }
  }

  .list {
    animation: scrollBottom 12s linear infinite;
  }
</style>