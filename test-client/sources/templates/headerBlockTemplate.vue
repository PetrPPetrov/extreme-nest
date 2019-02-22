<template>

    <header>
        <div class="container">
            <div class="row">
                <p class="hidden-xs hidden-sm col-md-6 col-lg-6 header-title">{{ title }}</p>
                <nav class="col-xs-9 col-sm-7 col-md-6 col-lg-6">
                    <router-link to="/testing" class="nav-button">Testing</router-link>
                    <router-link to="/generation" class="nav-button">Generation</router-link>
                </nav>
            </div>
        </div>
    </header>

</template>

<script>

    export default {
        name: 'headerTemplate',
        data() {
            return {
                title: 'extreme-nest-test-client'
            }
        }
    }

</script>

<style scoped>

    header {
        width: 100%;
        height: 50px;
        background-color: white;
        border-bottom: 1px solid #ACB1B4;
    }

    .header-title {
        color: #6F7D87;
        padding-top: 12px;
        font-size: 20px;
        font-family: 'Staatliches', cursive;
    }

    .nav-button {
        display: block;
        cursor: pointer;
        float: right;
        color: #6F7D87;
        padding: 15px 20px 10px 20px;
        font-size: 16px;
        font-family: 'Staatliches', cursive;
        transition: .3s;
        text-decoration: none;
    }

    .nav-button:hover {
        color: #1B95E0;
        border-bottom: 2px solid #1B95E0;
        text-decoration: none;
    }

    .active-nav-link {
        color: #1B95E0;
        border-bottom: 2px solid #1B95E0;
        text-decoration: none;
    }

    @media (max-width: 768px) {

        header {
            margin-bottom: 15px;
        }

        .nav-button {
            padding: 15px 10px 12px 10px;
            font-size: 14px;
        }

    }

</style>