<template>
  <div class="container mx-auto py-24 px-6">
    <h1 class="text-5xl font-sans italic text-center mb-12 text-gray-800">
      Մեր Ծառայությունները
    </h1>

    <div
      class="grid grid-cols-1 font-sans italic md:grid-cols-2 lg:grid-cols-3 gap-12"
    >
      <ServiceCard
        title="Հղկում"
        description="Մեր հղկման ծառայությունները ապահովում են մակերևույթի գերազանց հարթություն։"
        image="servicesImg/79241893.webp"
      />
      <ServiceCard
        title="Զոդում"
        description="Մենք մատուցում ենք բարձր որակի զոդման ծառայություններ մետաղական կոնստրուկցիաների համար։"
        image="servicesImg/GMAW.welding.af.ncs.jpg"
      />
      <ServiceCard
        title="Փոշեներկում"
        description="Փոշեներկման տեխնոլոգիան տալիս է երկարակյաց և գեղեցիկ արդյունքներ։"
        image="servicesImg/79256924.webp"
      />
      <ServiceCard
        title="Լազերային կտրում"
        description="Լազերային կտրումը թույլ է տալիս իրականացնել ճշգրիտ և բարդ կտրումներ։"
        image="servicesImg/79241895.webp"
      />
      <ServiceCard
        title="Solidworks"
        description="Solidworks ծրագրային փաթեթը ապահովում է ինժեներական դիզայնի արդյունավետություն։"
        image="servicesImg/images.jfif"
      />
    </div>
  </div>
</template>

<script>
import ServiceCard from '~/components/pages/services/ServiceCard.vue'

export default {
  auth: 'guest',
  components: {
    ServiceCard,
  },
  middleware: 'roleRedirect',
}
</script>

<style scoped></style>
