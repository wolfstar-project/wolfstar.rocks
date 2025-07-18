<template>
  <!-- Guild Card Skeleton - Loading placeholder with DaisyUI -->
  <div class="relative rounded-xl border border-base-300 bg-base-100 p-6 shadow-md">
    <!-- Status Indicator Skeleton -->
    <div class="absolute top-3 right-3">
      <div class="skeleton h-7 w-7 rounded-full opacity-60"></div>
    </div>

    <!-- Guild Card Content -->
    <div class="flex flex-col items-center space-y-4">
      <!-- Guild Icon Skeleton -->
      <div class="relative">
        <div class="skeleton h-20 w-20 rounded-2xl"></div>
        <!-- Online indicator skeleton -->
        <div class="absolute -right-1 -bottom-1 skeleton h-6 w-6 rounded-full"></div>
      </div>

      <!-- Guild Info Skeleton -->
      <div class="flex min-h-[4rem] w-full flex-col justify-center space-y-2">
        <!-- Guild Name Skeleton -->
        <div class="skeleton h-4 w-3/4 mx-auto rounded"></div>
        
        <!-- Guild Stats Skeleton -->
        <div class="flex items-center justify-center space-x-4">
          <div class="flex items-center space-x-1">
            <div class="skeleton h-3 w-3 rounded opacity-50"></div>
            <div class="skeleton h-3 w-8 rounded"></div>
          </div>
          <div class="flex items-center space-x-1">
            <div class="skeleton h-3 w-3 rounded opacity-50"></div>
            <div class="skeleton h-3 w-8 rounded"></div>
          </div>
        </div>
      </div>

      <!-- Action Button Skeleton -->
      <div class="w-full">
        <div class="skeleton h-8 w-full rounded-lg"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference '@/assets/css/main.css';
/* DaisyUI skeleton styling with modern shimmer animation */
.skeleton {
  @apply bg-base-300/40;
  position: relative;
  overflow: hidden;
}

.skeleton::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
</style> 
