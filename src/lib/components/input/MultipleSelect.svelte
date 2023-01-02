<script lang="ts" context="module">
	export interface SelectOption {
		label: string;
		value: string;
		selected?: boolean;
		default?: boolean;
		mustBeUnique?: boolean;
	}
</script>

<script lang="ts">
	import CloseIcon from '../icons/CloseIcon.svelte';

	export let options: SelectOption[];

	export let selectedOptions = options.filter((x) => x.selected);
	let notSelectedOptions = options.filter((x) => !x.selected);
</script>

<div class="flex flex-col gap-y-2">
	<div class="dropdown dropdown-end">
		<label
			for=""
			tabindex="-1"
			class="select flex items-center ">
			Click to view options
		</label
		>
		<ul tabindex="-1" class="mt-2 dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 flex flex-col gap-y-1">
			{#each notSelectedOptions as option}
				<li>
					<button
						class="menu-item"
						on:click={() => {
							option.selected = true;

							if (option.mustBeUnique) {
								options.forEach((x) => {
									if (x.value !== option.value)
										x.selected = false;
								});

								selectedOptions = [option];
								notSelectedOptions = options.filter((x) => x.value !== option.value);
							}
							else {
								selectedOptions.forEach((x) => {
									if (x.selected && x.mustBeUnique && x.value !== option.value)
										x.selected = false;
								});

								notSelectedOptions = options.filter((x) => !x.selected);
								selectedOptions = [option, ...selectedOptions.filter((x) => x.selected)];
							}
						}}
					>
						{option.label}
					</button>
				</li>
			{/each}
		</ul>
	</div>

	<!-- <select
		class="select w-full max-w-xs"
		disabled={notSelectedOptions.length === 0}
		on:change={handleSelect}
	>
		{#each notSelectedOptions as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select> -->

	{#if selectedOptions.length > 0}
		<div class="divider my-1 text-sm">Selected</div>

		<ul class="flex gap-2 flex-wrap">
			{#each selectedOptions as option}
				<div class="indicator py-2 px-3 bg-base-100 rounded-lg text-sm">
					{#if !option.mustBeUnique}
						<button
							class="indicator-item badge bg-slate-10 p-1 fill-slate-1"
							on:click={() => {
								option.selected = false;

								if (selectedOptions.length === 1) {
									selectedOptions = options.filter((x) => x.default);
									notSelectedOptions = options.filter((x) => !x.default);
								}
								else {
									selectedOptions = options.filter((x) => x.selected);
									notSelectedOptions = [...notSelectedOptions, option];
								}

							}}
						>
							<CloseIcon />
						</button>
					{/if}
					
					{option.label}
				</div>
			{/each}
		</ul>
	{/if}
</div>
