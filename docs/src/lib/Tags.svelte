<script lang="ts">

    export class Tag {
        name: string;
        link: string;

        constructor (name: string, link?: string) {
            this.name = name;
            this.link = link || '';
        }
    }

    export let tags: Tag[];
</script>

<div class="tags">
    {#each tags as tag}
        <span class="tag">{tag}</span>
    {/each}
</div>