---
title: How to build an efficient ELT Pipeline with dbt
date: 2021-06-05
slug: 2021-dbt
---

## Background

### The State of Data (as of 2021)

Whether you’re a Fortune 500 company managing petabytes or a startup just beginning to collect data, organizations across the US are investing in data warehouses and data lakes. The value of data is now universally recognized—terms like "big data" and "my data" are everywhere. Data is the foundation for leveraging technologies like AI and machine learning.

### "A string of pearls is only valuable when strung together"

Collecting data is just the first step; the real value comes from putting it to use. Most companies start by extracting key metrics to inform business decisions. As organizations mature, they move beyond simple reporting—using machine learning to build new product features, developing internal tools, and finding innovative ways to drive business value.

To add a more personal perspective, the company I currently work for has been building and using a BigQuery-based data warehouse for nearly three years. During this time, a significant amount of historical data has accumulated in BigQuery, and we've been leveraging machine learning to [solve many problems](https://tech.socarcorp.kr/data/2020/08/19/socar-data-group-intern-review.html).

However, as various use cases emerge from this accumulated data, problems inevitably begin to surface. 

1. Data Quality
    
    Data can continuously change over time, leading to declining data quality. There are generally two main scenarios: 1) **Natural data drift**, and 2) **Errors caused by faulty logic or unhandled external factors**. In most cases, edge cases that fall outside human expectations or simple human errors lead to data contamination. 
    
2. Data Version Management
    
    As mentioned above, as data continuously changes, data pipelines also undergo changes. While Spark-based data pipeline code is typically managed through git, managing the resulting data is not straightforward (data warehouses usually manage versions through table labels or table columns). SQL-based pipelines are even more challenging. Unless SQL is managed as code, tracking changes is difficult, and due to SQL's nature, conducting **peer reviews** on complex pipelines with 500+ lines of SQL code line by line is not easy. 
    
3. Data Ownership
    
    One might wonder if data doesn't belong to everyone in the company, but the reality is different. The more critical the data, the more important it becomes to have someone responsible for fixing issues when they arise, and someone with ownership to review and deploy new versions when logic changes, just like with code.
    
4. Data Dependency Management
    
    As the amount of data grows, more logic emerges that creates subsequent tables based on joins with fact/dimension tables or the update status of other tables (typically expressible as DAGs). This can lead to side effects when someone deletes or modifies existing tables and datasets. Without a clear understanding of data dependencies, it becomes difficult to safely manage data. 
    

### The Need for Systematic Data Management

Several data-related terms have emerged to address the problems mentioned above. 

1. Data Catalog
    
    
    ![Source: [Complete Guide to Data Catalog Tools and Architecture](https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.xenonstack.com%2Finsights%2Fdata-catalog%2F&psig=AOvVaw07NJQZW5arZHRXjhjYc0zf&ust=1622962278103000&source=images&cd=vfe&ved=0CA0QjhxqFwoTCMjyiuPz__ACFQAAAAAdAAAAABAD)](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/9c4e7e41-96d5-4ac6-a592-c097cf5b6204/Untitled.png)
    
    Source: [Complete Guide to Data Catalog Tools and Architecture](https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.xenonstack.com%2Finsights%2Fdata-catalog%2F&psig=AOvVaw07NJQZW5arZHRXjhjYc0zf&ust=1622962278103000&source=images&cd=vfe&ved=0CA0QjhxqFwoTCMjyiuPz__ACFQAAAAAdAAAAABAD)
    
    Data catalogs help manage data effectively by collecting metadata. AWS Glue Catalog is a representative Data Catalog provided by cloud providers, while BigQuery and Snowflake have their Data Warehouses serve the catalog role as well. Databricks' [Delta Lake](https://databricks.com/product/delta-lake-on-databricks) is also known to provide similar functionality. 
    
2. Data Observability
    
    
    ![Source: [https://newrelic.com](https://newrelic.com/)](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/56610972-b59a-4361-93e2-a392041b3f45/Untitled.png)
    
    Source: [https://newrelic.com](https://newrelic.com/)
    
    Data observability provides beautiful visualizations of data pipelines and data distributions, making it easier for people to understand and efficiently manage data quality. [New Relic](https://newrelic.com) and [Databand](https://databand.ai) are well-known solutions in this space. 
    
3. Data Lineage
    
    
    ![Source: [Data Lineage - Mapping Your Data Journey | Subsurface](https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.dremio.com%2Fdata-lake%2Fdata-lineage%2F&psig=AOvVaw3WqsksGr2GLB7qq0ymGt2m&ust=1622962473367000&source=images&cd=vfe&ved=0CA0QjhxqFwoTCMCn88H0__ACFQAAAAAdAAAAABA9)](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/e3962855-85dc-4091-a0d5-ec0549c683ca/Untitled.png)
    
    Source: [Data Lineage - Mapping Your Data Journey | Subsurface](https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.dremio.com%2Fdata-lake%2Fdata-lineage%2F&psig=AOvVaw3WqsksGr2GLB7qq0ymGt2m&ust=1622962473367000&source=images&cd=vfe&ved=0CA0QjhxqFwoTCMCn88H0__ACFQAAAAAdAAAAABA9)
    
    Data lineage, like catalogs, is a method for efficiently managing metadata. It visualizes data flow and implements lineage tracking to solve data version management and dependency identification problems.
    
    ![Source: [dbt introduction](https://docs.getdbt.com/docs/introduction)](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/cc94774a-ab76-4d97-abef-d422445e67e5/Untitled.png)
    
    Source: [dbt introduction](https://docs.getdbt.com/docs/introduction)
    

In addition, modern data infrastructure is seeing an influx of various terms like [Data Governance](https://searchdatamanagement.techtarget.com/definition/data-governance) and [Data Mesh](https://bcho.tistory.com/1379). Rather than applying all of them, it's better to focus on solving actual problems with methodologies that fit your specific situation.

For more information, check out:

[Understanding Modern Data Infrastructure](https://www.youtube.com/playlist?list=PLL-_zEJctPoJ92HmbGxFv1Pv_ugsggGD2)

This series covers various modern data stacks.

Today's topic, dbt, addresses the problems mentioned above through Data Lineage and focuses on the T (Transform) in ELT pipelines. 

## What is dbt?

dbt stands for **data build tool** and is designed to make **transformation easy**, specifically SQL-based transformation in the extract-transform-load process. 

[dbt (data build tool) - Transform data in your warehouse](https://www.getdbt.com)

(It supports plugins that communicate with Spark clusters, but rather than using Python/Scala, it appears to communicate with thrift/HTTP servers and execute HiveQL).

It's widely used by companies like GitLab, Grailed, Slack, and Notion. (However, use cases in Korea are not yet well-known)

In summary:

> A SQL-based Transform tool focused solely on the T in ETL
> 

### CLI vs Cloud

dbt has [CLI mode](https://docs.getdbt.com/dbt-cli/cli-overview) and [Cloud mode](https://docs.getdbt.com/docs/dbt-cloud/cloud-overview).

CLI mode installs dbt as a Python package. It uses YAML for managing table metadata and unit tests, Jinja templates for various macros and UDFs, and calculates dependencies between tables. CLI mode is also **free**(!). More details will be covered below.

https://www.loom.com/embed/05f9c34b17c74c97b98286683dafd420

Cloud mode is a paid service. It provides all the features available in CLI mode, plus an integrated SQL development environment (IDE). Through the web IDE, analysts and SQL users can control unit testing for their tables, pull requests from a workflow perspective, and basic Git branch operations like software developers, making the overall SQL development process easier to maintain. It also allows creating CronJobs. dbt Cloud service pricing is as follows. 

![Source: https://www.getdbt.com/pricing/](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/357f9be1-d98d-43bc-8a20-ae3b8a29f696/Untitled.png)

Source: https://www.getdbt.com/pricing/

Personally, I feel dbt Cloud's strongest selling point is that it simplifies the tedious aspects of dbt work (checking compiled queries, reviewing results, git operations, etc.) through its web interface. However, dbt CLI can handle most features as well. (Not to mention, $50 per person per month is quite expensive...)

### What are the advantages and disadvantages?

Based on my experience implementing dbt in an actual company:

**Advantages**

- Various data unit testing can make existing pipelines more robust
- Intuitive Docs UI reduces communication costs for finding data
- Long SQL can be broken down into reusable modules
- (Not dbt-specific) Managing SQL through code and development cycles allows systematic management of queries and tables through SQL reviews and style conventions
- Various macros and open-source tools exist
- Uses existing data warehouse resources more efficiently without requiring separate cloud or on-premises resources
- Reduces overhead for SQL-based data operations, allowing focus on table modeling and architectural considerations

**Disadvantages**

- Requires systematic management of YAML, which can lead to manual tasks
- Has a learning curve, requiring internal training
- It's a tool focused only on Transform, so other tools must be used alongside it for Extract or Load
- When using only CLI, monitoring which queries are running is not easy
    - BigQuery adapter and others have mechanisms like max bytes billed limit that can be well controlled

### When to consider adopting dbt

- When there are many SQL-based data queries and table creations
- When using MPP-based data warehouses in ELT pipeline environments
    - Traditional ETL pipelines often combine Transform and Load (like using PySpark to `df.read` then `df.write`...)
    - dbt is a library for transformation, with limited support for loading
- When there are many people in the company who work with SQL
    - Since dbt performs data transformation work based on SQL, the more people who work with SQL, the greater the productivity impact
- When systematic management of derived tables is needed due to high query costs
    - Due to the nature of BigQuery and Snowflake, creating tables is much easier than with traditional RDBMS. This creates a trade-off where tables are created indiscriminately and the same table is created in multiple places, leading to unnecessary data scanning and high query costs
    - When you start managing tables systematically through dbt, it becomes easier to understand metadata such as which tables are currently managed, who has ownership, and what columns and tests are used for management. Therefore, in the long term, except for unavoidable cases, you can reduce both the effort to find needed data and query costs

### When not to consider adopting dbt

- When there aren't many people in the company who work with SQL
- When Hadoop-based data warehouses and Spark-based data processing are more familiar and well-maintained
- When the speed of handling ad-hoc requests is more important than systematic metadata and table management

## Understanding dbt's Basic Features

The following explanation is based on dbt CLI.

All code and development environment configurations can be found in the GitHub repository below.

[ahnsv/dbt-proof-of-concept](https://github.com/ahnsv/dbt-proof-of-concept)

The configuration for demonstrating dbt's features is as follows:

- dbt codebase
- Postgres Docker for DW mocking
- (optional) devcontainer

- Python 3.8.x based dbt initial setup
    
    
    Install dependencies using pyenv and poetry
    
    ```bash
    # cd <PROJECT_NAME>
    $ pyenv shell 3.8.2
    
    $ poetry config virtualenvs.in-project true # Install dependencies in .venv
    
    $ poetry new dbt # Create a new poetry project
    
    $ poetry add "dbt-core==0.19.1" "dbt-postgres==0.19.1"
    
    # cd <PROJECT_NAME>/dbt
    $ dbt init --adapter postgres core # Create a dbt project
    
    $ cd core && tree .
    ├── README.md
    ├── analysis
    ├── data
    ├── dbt_project.yml
    ├── macros
    ├── models
    │   └── example
    │       ├── my_first_dbt_model.sql
    │       ├── my_second_dbt_model.sql
    │       └── schema.yml
    ├── snapshots
    └── tests
    	
    ```
    

Additionally, the databases and warehouses currently supported by dbt are as follows:

- BigQuery
- Snowflake
- Postgres
- Redshift
- MS SQL
- Oracle
- Presto
- Apache Spark (Thrift, HTTP Server)
- Microsoft Azure Synapse DW
- Dremio
- ClickHouse

(In dbt, these are expressed as **adapters**)

### dbt Project Structure

```
├── README.md
├── analysis
├── data
├── dbt_project.yml
├── macros
├── models
│   └── example
│       ├── my_first_dbt_model.sql
│       ├── my_second_dbt_model.sql
│       └── schema.yml
├── snapshots
└── tests
```

This is the structure of an initial dbt project. 

- `data` contains static files for data feeding like CSV files. You can load data into the data warehouse/database by executing insert queries through the `dbt seed` command. ([Example](https://www.notion.so/dbt-ELT-57ea30f4a6ac4ed598782510b4590abe?pvs=21))
- `analysis` contains SQL files for analysis only, not for creating tables. Queries are not actually executed through the `dbt run` command, but are used only for compile testing (`dbt compile`)
    - Example
        
        `analysis/customer_count.sql`
        
        ```sql
        with customers as (
            select *
            from {{ ref('raw_customer') }}
        )
        
        select count(1)
        from customers
        ```
        
        This query is compiled as follows:
        
        `target/compiled/core/analysis/customer_count.sql`
        
        ```sql
        with customers as (
            select *
            from "dbt"."transformed"."raw_customer"
        )
        
        select count(1)
        from customers
        ```
        
- `dbt_project.yml` contains metadata for the dbt project. ([Documentation](https://docs.getdbt.com/reference/dbt_project.yml))
- `macros` is a directory containing user-defined Jinja template macros.
    - Example
        
        ```sql
        {% macro cents_to_dollars(column_name, precision=2) %}
            ({{ column_name }} / 100)::numeric(16, {{ precision }})
        {% endmacro %}
        ```
        
        The above macro can be used in models as follows:
        
        ```sql
        select
          id as payment_id,
          {{ cents_to_dollars('amount') }} as amount_usd,
          ...
        from app_data.payments
        ```
        
- `models` is where tables created with dbt are gathered. It's dbt's main working directory. ([Example](https://www.notion.so/dbt-ELT-57ea30f4a6ac4ed598782510b4590abe?pvs=21))
- `snapshot` creates tables with information about snapshots of source tables
    - Example
        
        ```sql
        {% snapshot orders_snapshot %}
        
        {{
            config(
              target_database='analytics',
              target_schema='snapshots',
              unique_key='id',
        
              strategy='timestamp',
              updated_at='updated_at',
            )
        }}
        
        select * from {{ source('jaffle_shop', 'orders') }}
        
        {% endsnapshot %}
        ```
        
        The above SQL file creates a model called orders_snapshot through the `dbt snapshot` command.
        
        When the query is first executed through the dbt snapshot command, the data at that point in time is attached with `dbt_valid_from` and `dbt_valid_to` columns.
        
        From the second time onwards, new rows are inserted into the table.
        
    
    It's mainly used with source tables. (e.g., when you want to keep daily snapshots of tables that are consistently inserted through daily batches)
    
- `tests` contains definitions of tests for models and snapshots

### dbt Terminology

- Model
    
    Simply put, it's a table. When you create a SQL file in the `models` directory, it's compiled into SQL syntax like `CREATE TABLE AS` or `CREATE OR REPLACE TABLE` and adds a table to the connected data warehouse and database. (Therefore, it's good to manage Schema and privileges well) If you don't give the `incremental` option, it overwrites the existing table (like TRUNCATE INSERT in BigQuery), so be careful.
    
- Source
    
    Refers to the source data/table when creating models. Unlike models, Source doesn't overwrite tables. According to [Best Practice](https://docs.getdbt.com/docs/guides/best-practices), rather than using Source directly, it's recommended to create Staging tables that rename columns from Source Tables according to conventions and, if necessary, make them in a form that's easy to work with through simple where clauses or joins. 
    
- Schema
    
    People familiar with RDBMS might confuse it with Database - Schema - Table. dbt's Schema refers to the specification for tables that will be created through models (e.g., table name, description, column name, test ...)
    
    - Example schema.yml
        
        ```yaml
        version: 2
        
        models:
          - name: transactions
            description: Table containing detailed information by order
            columns:
              - name: order_id
                tests:
                  - unique
                  - not_null
                description: This is a unique identifier for an order
        
              - name: customer_id
                description: Foreign key to the customers table
                tests:
                  - not_null
                  - relationships:
                      to: ref('stg_customers')
                      field: customer_id
        
              - name: customer_name
                description: customers full name
                tests:
                  - not_null
        ```
        
- Profile
    
    This is metadata for connecting dbt with DW and DB. It's good to maintain a 1:1 relationship between one dbt project and one profile. More detailed information can be found in [dbt's documentation](https://docs.getdbt.com/reference/profiles.yml). By default, when you create a dbt project, it creates and uses `~/.dbt/profiles.yml`. However, in collaborative environments, there may be constraints on using different profiles for each local environment, so I personally recommend creating a profiles yaml inside the project and overriding it using the `--profiles-dir` flag.  
    
    - Example Profile yaml
        
        ```sql
        config:
            send_anonymous_usage_stats: False
            use_colors: True
        
        dbt:
          target: dev
          outputs:
            dev:
              type: postgres
              host: warehouse
              port: 5432
              user: dbt
              password: dbt
              dbname: dbt
              schema: transformed
              threads: 3
        ```
        
- Target
    
    It's most accurate to see this as the environment where dbt will run. Most are configured as dev/prod, dev/live, etc., and distinguish between configurations for running in development and production environments. By default, when executing dbt commands, settings like how many threads to use and (limited to some adapters) max bytes billed are set differently for each environment. 
    

### Initial Data Loading

1. Create a CSV file in the `data` directory
    
    ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/444fac9d-3893-4d63-a9cc-ba34fbe00f6d/Untitled.png)
    
2. Enter the `dbt seed` command
    
    ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/4ac6be46-2f54-4372-8e96-3da14a5693b3/Untitled.png)
    
3. You can create a table in the target based on the CSV file like a model
    
    ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/65663ba9-303a-44bf-ba68-c6cac8292ff6/Untitled.png)
    

### Creating Your First Model

1. Create `models/staging/stg_orders.sql`
    
    ```sql
    with source as (
        select * from {{ ref('raw_orders') }}
    ),
    
    renamed as (
        select
            id as order_id,
            user_id as customer_id,
            order_date,
            status
        from source
    )
    
    select * from renamed
    ```
    
2. Execute the `dbt run` command 
    
    ![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/97591abe-cfbf-453a-87ce-6a8e45531e2f/Untitled.png)
    

3. Check the table

![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/10a981df-8420-4bfd-8321-ce751febb658/Untitled.png)

- For conventions on table layering like separating staging/mart, it's good to refer to the [guide by fishtown analytics who created dbt](https://github.com/fishtown-analytics/corp/blob/master/dbt_style_guide.md).
- For model selection tips, if you give `+model_name` as the `--model` option, it will build all tables that have dependencies on that model. The related syntax is well organized in [GitLab's dbt guide](https://about.gitlab.com/handbook/business-technology/data-team/platform/dbt-guide/#command-line-cheat-sheet).
    
    
    ![Updates tables like payments, orders that are connected to the transactions table together.](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/2a165b50-05c2-404d-8e51-a2051c5f8b35/Untitled.png)
    
    Updates tables like payments, orders that are connected to the transactions table together. 
    

### Documentation

You can create a webpage to view the metadata of dbt models created so far with two commands.

`dbt docs generate`

This command compiles models, draws a dependency graph, and stores the metadata in the `target` folder (this is the default, but you can change it to another name in `dbt_project.yml`) in the form of `manifest.json` and `catalog.json`. It also creates an `index.html` file to visualize it.

`dbt docs serve`

Launches a simple web server so you can view it on localhost.

![dbt docs serve → [localhost:8080](http://localhost:8080)](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/84eb6397-8f7d-4e84-b4fc-88e10486483f/Untitled.png)

dbt docs serve → [localhost:8080](http://localhost:8080) 

As shown in the screenshot above, you can easily view the metadata, column information, and dependency relationships of the transactions model created in the example above in webpage format. The description is currently empty, but you can leave documentation about the table here in markdown format, such as what kind of table it is, simple logic explanations, etc. ([Reference](https://docs.getdbt.com/docs/building-a-dbt-project/documentation#using-docs-blocks))

![You can view table dependencies in more detail in fullscreen view.](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/76454ba8-9f54-4874-a071-4bb49db3ffd7/Untitled.png)

You can view table dependencies in more detail in fullscreen view. 

### Creating Your First Test

There are two main types of tests in dbt.

1. Tests before running dbt run
2. Tests after running dbt run

For case 1, from basic tests like whether data is properly loaded into source tables, whether specific columns are non-null or unique, to custom test macros, you can have more test cases (for example, if the daily updated row count is n for a certain period, whether today's row count deviates significantly from this distribution... I'll explain this in more detail through the company's tech blog)

For case 2, it tests whether data was created as expected for tables created through the dbt run command. Like case 1, you can test the pipeline using various test cases.

You can add tests by simply adding a line or so of code to `schema.yml` (case 2) or `source.yml` (case 1).

As an example, let's add test cases to check if data was properly loaded into the transactions model created above (case 2)

```yaml
version: 2

models:
  - name: transactions
    description: Table containing detailed information by order
    columns:
      - name: order_id
        tests:
          - unique
          - not_null
        description: This is a unique identifier for an order

      - name: customer_id
        description: Foreign key to the customers table
        tests:
          - not_null
          - relationships:
              to: ref('stg_customers')
              field: customer_id

      - name: customer_name
        description: customers full name
        tests:
          - not_null

      - name: order_date
        description: Date (UTC) that the order was placed

      - name: status
        tests:
          - accepted_values:
              values:
                ["placed", "shipped", "completed", "return_pending", "returned"]

      - name: amount
        description: Total amount (AUD) of the order
        tests:
          - not_null

      - name: credit_card_amount
        description: Amount of the order (AUD) paid for by credit card
        tests:
          - not_null

      - name: coupon_amount
        description: Amount of the order (AUD) paid for by coupon
        tests:
          - not_null

      - name: bank_transfer_amount
        description: Amount of the order (AUD) paid for by bank transfer
        tests:
          - not_null

      - name: gift_card_amount
        description: Amount of the order (AUD) paid for by gift card
        tests:
          - not_null
```

As shown above, you can write both documentation and test cases for models in the yml file.

To run tests, use the `dbt test` command

![](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/2af315b0-aeb5-47ce-a3c4-8bf7a0e2b5be/Untitled.png)

The example test above only used test cases provided by default in dbt. To see specifically what queries were used to perform the tests, you can look at the `target/compiled` directory. Let's examine how the test for the status column in schema.yml was converted to a query:

```sql
with all_values as (
    select distinct
        status as value_field
    from "dbt"."transformed"."transactions"
),

validation_errors as (
    select
        value_field
    from all_values
    where value_field not in (
        'placed','shipped','completed','return_pending','returned'
    )
)

select count(*) as validation_errors
from validation_errors
```

The result of this query will be 0 or a value of 1 or more. If it's 0, it passes; otherwise, it fails. In this way, dbt testing can simply test columns and tables through SQL by checking whether the query result is 0 or another value, so you can cover various test cases with just basic SQL knowledge.

## Conclusion

As we've seen above, dbt helps solve various problems in modern data infrastructure using only SQL. Unlike existing data processing methods that require processing in distributed systems with high costs, it delegates processing to Data Warehouse functions, creates modular reusable blocks using Jinja templates, adds documentation and test cases simply with YAML, and allows viewing metadata through web pages, reducing communication costs between organizations that manage data and those that consume it.

I wanted to cover more detailed content in this article, but the article became too long just covering background explanations and basic features, so I plan to organize more advanced features and tips and learnings gained from operating in actual production environments in the next article. For example:

- Creating fast and stable SQL-based data pipelines with Airflow custom dbt operator
- Managing SQL coding conventions with pre-commit + sqlfluff
- More efficient data management of dbt codebase with custom macros and dbt packages
- More detailed model layer separation and easy-to-maintain dbt tips
- Building dbt-based Data Observability dashboards

As mentioned above, many companies are still operating Hadoop-based data infrastructure or environments where it's difficult to apply dbt. As I habitually say, there's no silver bullet. New technologies emerge daily in the data industry, and dbt could also be just a fad.

Adding my personal thoughts, I think there's a trend where many more places are building data infrastructure with ELT paradigms rather than ETL (though it's not that it can't be used in ETL at all...), and it's a technology worth considering as an alternative to Apache Spark, which had a steep learning curve but a broad user base.