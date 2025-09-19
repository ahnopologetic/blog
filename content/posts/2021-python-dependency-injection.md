---
title: Python Application Dependency Injection - dependency injector
date: 2021-08-16
slug: dip-with-dependency-injector
---


<aside>
💡 Creating low-coupling, high-cohesion code in Python applications with Dependency Injector

</aside>

## Background

I've been thinking a lot about application design lately. Among these concerns, the problem of **dependencies** is not limited to specific languages, frameworks, or object-oriented programming alone.

[[Elegant Tech Seminar] 190620 Elegant Object-Oriented by Jo Young-ho, Development Director at Woowa Brothers](https://youtu.be/dJ5C4qRqAgA?t=82)

Jo Young-ho: "The core of design is dependencies"

These days, Python is my main language, but unlike object-oriented languages, traditional Python has lacked discussion about dependency injection (most discussions are about pip package dependencies...). Some say that due to Python's flexible and non-compiled language characteristics, Python developers don't need dependency injection frameworks, but I think effective internal dependency management in applications is necessary for projects developed by multiple people, maintaining maintainable and testable code, and creating "mature" code. 

[Why is IoC / DI not common in Python?](https://stackoverflow.com/a/2465052)

Related Stack Overflow question/answer

While pondering **"Isn't there an elegant way to manage dependencies in Python?"**, I discovered a library called [**dependency-injector**](https://python-dependency-injector.ets-labs.org/). Thanks to this, I was able to focus more on designing roles, responsibilities, and collaboration relationships at the code level rather than worrying about where and how (**HOW**) to inject dependencies.

I plan to review the essential concepts, how other frameworks or libraries solve dependency problems, and organize the roles and functions that dependency-injector provides. 

---

In this block, I want to review concepts related to dependencies (mainly dealt with in object-oriented design) and discuss why dependency injection is necessary. If you already know this content well and want to learn about library usage, you can skip directly to the [DI in Other Frameworks](https://www.notion.so/dependency-injector-89d14f1aee5642ec9eada5add0ddec38?pvs=21) or [Dependency Injector](https://www.notion.so/dependency-injector-89d14f1aee5642ec9eada5add0ddec38?pvs=21) sections.

## What is Dependency?

> Dependency between two components is a measure of the probability that changes to one component could affect also the other

Dependency between two components means the probability that changes to one component could affect the other component.

Source: http://blog.rcard.in/programming/oop/software-engineering/2017/04/10/dependency-dot.html
> 

As code becomes complex, collaborative relationships between various objects are inevitably created. To collaborate, you need to know that other objects exist and understand how other objects receive "messages." This knowledge of objects creates dependencies (referenced from Objects).

For application design to become flexible, it should have minimal specific details about the execution context. This way, you can create code that makes it easy to add features, change logic, or write tests. 

> **Implicit dependencies are bad**

Implicit dependencies create the need to understand the internal implementation of code in detail to understand dependencies. This violates [encapsulation](https://javacpro.tistory.com/31). Therefore, explicitly exposing dependencies to objects lowers the barrier to maintenance for code readers.
> 

## What is Dependency Injection?

> **Dependency injection** is a method of resolving dependencies by having an external independent object create an instance and then passing it, rather than the object that uses it.

From Chapter 9 of Objects
> 

Dependency injection is one of the methods to solve the dependency management problems mentioned above. Alternatives include the Service Locator pattern (the biggest disadvantage of the SL pattern is that it creates/hides dependencies implicitly) ([Martin Fowler: Using Service Locator](https://martinfowler.com/articles/injection.html#UsingAServiceLocator), [vs DI comparison](https://stackoverflow.com/a/65606097))

### Why is Dependency Injection Necessary?

There are much better explanations and extensive materials, but the necessity of dependency injection that I feel is:

- Object creation is handled by another place (container), reducing coupling
- Low coupling makes changes easier and allows more focus on collaborative relationships with other objects
- Injecting Fake, Mocking objects makes testing easier

## What is the Dependency Inversion Principle?

This is principle D among the SOLID principles of object orientation:

> First, high-level modules should not depend on low-level modules. Both high-level and low-level modules should depend on abstractions.
Second, abstractions should not depend on details. Details should depend on abstractions.
> 

[](https://ko.wikipedia.org/wiki/%EC%9D%98%EC%A1%B4%EA%B4%80%EA%B3%84_%EC%97%AD%EC%A0%84_%EC%9B%90%EC%B9%99)

In short, it's an important principle of object-oriented design that for flexible and reusable design, you should depend on abstractions rather than detailed implementation details.

Therefore, connecting this with the dependency injection above, objects depend on high-level layers (abstractions), and when the container that provides dependency injection injects detailed objects according to use cases, more flexible design becomes possible (this is how I understand it...)

I'll cover the details again in the section on refactoring existing code at the bottom. 

## First Summary

- As applications become more sophisticated, dependencies on other objects increase
- Dependency injection is a technique for effectively managing dependencies
- Dependency injection can create low-coupling, changeable and testable code
- Depending on high-level abstractions rather than low-level implementation details can create more flexible design

---

## DI in Other Frameworks

### Django

```python
# settings.py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': REDIS_URL + '/1',
    },
    'local': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'snowflake',
    }
}
```

In Django, environment-specific dependencies are specified in dictionary format as key-value pairs, and dependencies are injected using Python's duck typing functionality.

Pros

- Concise

Cons

- Ugly (personal opinion)
- Poor scalability (you'd have to hide that code somewhere...)

### Django Rest Framework

```python
class FooView(APIView):
    # The "injected" dependencies:
    permission_classes = (IsAuthenticated, )
    throttle_classes = (ScopedRateThrottle, )
    parser_classes = (parsers.FormParser, parsers.JSONParser, parsers.MultiPartParser)
    renderer_classes = (renderers.JSONRenderer,)

    def get(self, request, *args, **kwargs):
        pass

    def post(self, request, *args, **kwargs):
        pass
```

DRF injects dependencies based on classes.

Pros

- You can add functionality through class methods.

Cons

- Strongly coupled to web server framework

### Spring

Convenient annotation-based IoC and Dependency Injection is one of Spring's greatest advantages.

Spring basically has a container called ApplicationContext. Spring's Bean is a (basically) singleton Java object managed by this ApplicationContext, which can be accessed and used by various components within the Spring context. (It's been so long since I used Spring that I'm not sure if I'm expressing this correctly...)

1. Constructor Injection
    
    ```java
    @Configuration
    public class AppConfig {
    
        @Bean
        public Item item1() {
            return new ItemImpl1();
        }
    
        @Bean
        public Store store() {
            return new Store(item1());
        }
    }
    ```
    
    You can register and use dependencies in ApplicationContext with just one Bean annotation.
    
2. Setter Injection
    
    ```java
    @Bean
    public Store store() {
        Store store = new Store();
        store.setItem(item1());
        return store;
    }
    ```
    
3. Field Injection
    
    ```java
    public class Store {
        @Autowired // I remember this method is deprecated these days and changed to putting it in the constructor
        private Item item; 
    }
    ```
    

~~I want to use Spring...~~

Source: https://www.baeldung.com/inversion-control-and-dependency-injection-in-spring

---

## Dependency Injector

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/8e8585cc-fa8f-4bd5-930b-7657318f353c/Untitled.png)

### Philosophy

Dependency Injector aims to convey the following values:

[Dependency injection and inversion of control in Python - Dependency Injector 4.35.2 documentation](https://python-dependency-injector.ets-labs.org/introduction/di_in_python.html)

- Flexibility: Allows adding and changing functionality by combining various components differently
- Testability: Makes it easy to inject mocking, making codebase and business logic testable
- Clarity and maintainability: Makes dependencies explicit (this aligns with "Explicit is better than implicit" (PEP 20 - The Zen of Python)). Therefore, it enables understanding and control of the overall application system in one place.

### Why do I recommend this library?

There are actually many other Python libraries that implement Dependency Injection.

The reasons I recommend Dependency Injector are:

1. **Sophisticated Testing**
    
    This is one of the things I personally consider most important when choosing a library. With Dependency Injector, I could clearly understand how to use it just by looking at the test code.
    
2. **Production-level Usability**
    
    It's already being used in famous libraries (BentoML, etc.)
    
3. **Framework Agnostic**
    
    It's not locked into specific frameworks and can be used in all applications that use Python(!)
    
4. **Various Examples**
    
    From examples using famous frameworks like Flask, Django, FastAPI to CLI applications, microservices, clean architecture patterns, etc., examples are explained in detail enough to be used almost as-is.
    
    Reference: https://python-dependency-injector.ets-labs.org/examples/index.html
    
5. **Python Typing Support**
    
    These days, Python typing seems to be mainstream like js-ts. 
    

### Main Features

[**Providers**](https://python-dependency-injector.ets-labs.org/providers/index.html)

Providers actually serve the role of gathering objects/dependencies. They create objects and inject dependencies into other providers.

1. **Configuration Provider**
    
    ```python
    from dependency_injector import providers, containers
    
    class ApplicationContainer(containers.DeclarativeContainer): # Explained in container section below
    	config = providers.Configuration()
    
    ...
    
    container = Container()
    container.config.from_dict(
        {
            'aws': {
                 'access_key_id': 'KEY',
                 'secret_access_key': 'SECRET',
             },
        },
    )
    assert container.config.aws.acces_key_id == "KEY"
    assert container.config.aws.secret_access_key == "SECRET"
    ```
    
    Configuration providers are declared in containers and data is injected in the usage part.
    
    1. ini files
    2. yaml files
    3. Pydantic Settings classes
    4. dictionary
    5. environment variables
    
    Configuration-related information is retrieved from various sources and injected into providers. 
    
    Personally, I find the Pydantic Settings class method more attractive for writing validation logic than other methods, so I use it frequently. Using this enables the following validation:
    
    ```python
    from pydantic import BaseSettings, Field, validator
    from dependency_injector import containers, providers
    
    class ApplicationEnvironment(str, Enum):
    	LOCAL = "local"
    	DEV = "dev"
    	PROD = "prod"
    	TEST = "test"
    
    class DatabaseSettings(BaseSettings):
    	db_host: str = Field(default="localhost", env="DATABASE_HOST")
    	db_port:  = Field(default=3306, env="DATABASE_PORT")
    	...
    
    class ApplicationSettings(BaseSettings): 
    	env: ApplicationEnvironment = Field(default="local", env="ENV")
    	db: DatabaseSettings = DatabaseSettings()
    
    	@validator('some_field')
    	def validate_some_field(v, values): 
    		if v == values.get('some_other_field'): 
    			raise ValueError('Values cannot be the same')
    		return v
    
    class ApplicationContainer(containers.DeclarativeContainer):
    	config = providers.Configuration()
    	...
    ```
    
    This can reduce human errors in environment variable and config management and isolate them from application logic.
    
    (I found this alone very attractive...)
    
2. **Factory Provider**
    
    Factory providers are providers that create objects. 
    
    ```python
    from dependency_injector import containers, providers
    
    class User:
        ...
    
    class DetailedUser:
    	def __init__(self, name: str) -> None:
    		self.name = name
    
    class Container(containers.DeclarativeContainer):
    
        user_factory = providers.Factory(User)
    		detailed_user_factory = providers.Factory(User, name="humphrey")
    
    if __name__ == '__main__':
        container = Container()
    
        user1 = container.user_factory()
        user2 = container.user_factory()
    
    		humphrey_user = container.detailed_user_factory()
    
    		assert humphrey_user.name == "humphrey" # True
    ```
    
    The first argument of `providers.Factory` is the object to create, and the subsequent arguments can inject constructor arguments.
    
    You can use it simply as above, or you can chain factory providers.
    
    ![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/007c889b-2ba7-4c24-ac4d-72dc310010fd/Untitled.png)
    
    ```python
    from dependency_injector import containers, providers
    
    class Regularizer:
        def __init__(self, alpha: float) -> None:
            self.alpha = alpha
    
    class Loss:
        def __init__(self, regularizer: Regularizer) -> None:
            self.regularizer = regularizer
    
    class ClassificationTask:
        def __init__(self, loss: Loss) -> None:
            self.loss = loss
    
    class Algorithm:
        def __init__(self, task: ClassificationTask) -> None:
            self.task = task
    
    class Container(containers.DeclarativeContainer):
    
        algorithm_factory = providers.Factory(
            Algorithm,
            task=providers.Factory(
                ClassificationTask,
                loss=providers.Factory(
                    Loss,
                    regularizer=providers.Factory(
                        Regularizer,
                    ),
                ),
            ),
        )
    
    if __name__ == '__main__':
        container = Container()
    
        algorithm_1 = container.algorithm_factory(
            task__loss__regularizer__alpha=0.5,
        )
        assert algorithm_1.task.loss.regularizer.alpha == 0.5
    
        algorithm_2 = container.algorithm_factory(
            task__loss__regularizer__alpha=0.7,
        )
        assert algorithm_2.task.loss.regularizer.alpha == 0.7
    ```
    
    You can also create aggregate classes
    
    ![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/601a689b-da7c-4df1-8bd7-9a178914894c/Untitled.png)
    
    ```python
    import dataclasses
    import sys
    
    from dependency_injector import containers, providers
    
    @dataclasses.dataclass
    class Game:
        player1: str
        player2: str
    
        def play(self):
            print(
                f'{self.player1} and {self.player2} are '
                f'playing {self.__class__.__name__.lower()}'
            )
    
    class Chess(Game):
        ...
    
    class Checkers(Game):
        ...
    
    class Ludo(Game):
        ...
    
    class Container(containers.DeclarativeContainer):
    
        game_factory = providers.FactoryAggregate(
            chess=providers.Factory(Chess),
            checkers=providers.Factory(Checkers),
            ludo=providers.Factory(Ludo),
        )
    
    if __name__ == '__main__':
        game_type = sys.argv[1].lower()
        player1 = sys.argv[2].capitalize()
        player2 = sys.argv[3].capitalize()
    
        container = Container()
    
        selected_game = container.game_factory(game_type, player1, player2)
        selected_game.play()
    
        # $ python factory_aggregate.py chess John Jane
        # John and Jane are playing chess
        #
        # $ python factory_aggregate.py checkers John Jane
        # John and Jane are playing checkers
        #
        # $ python factory_aggregate.py ludo John Jane
        # John and Jane are playing ludo
    ```
    
3. **Singleton Provider**
    
    Singleton providers create objects that operate in singleton mode, as the name suggests.
    
    It was convenient to make database engines or sessions singletons.
    
    Singleton providers can be thought of as having one object bound per container. 
    
    ```python
    from dependency_injector import containers, providers
    
    class UserService:
        ...
    
    class Container(containers.DeclarativeContainer):
    
        user_service_provider = providers.Singleton(UserService)
    
    if __name__ == '__main__':
        container1 = Container()
        user_service1 = container1.user_service_provider()
        assert user_service1 is container1.user_service_provider()
    
        container2 = Container()
        user_service2 = container2.user_service_provider()
        assert user_service2 is container2.user_service_provider()
    
        assert user_service1 is not user_service2
    ```
    
    If you need a singleton object to be shared across multiple threads, use the ThreadSafeSingleton provider
    
    ```python
    import threading
    import queue
    
    from dependency_injector import containers, providers
    
    def put_in_queue(example_object, queue_object):
        queue_object.put(example_object)
    
    class Container(containers.DeclarativeContainer):
    
        thread_local_object = providers.ThreadLocalSingleton(object)
    
        queue_provider = providers.ThreadSafeSingleton(queue.Queue)
    
        put_in_queue = providers.Callable(
            put_in_queue,
            example_object=thread_local_object,
            queue_object=queue_provider,
        )
    
        thread_factory = providers.Factory(
            threading.Thread,
            target=put_in_queue.provider,
        )
    
    if __name__ == '__main__':
        container = Container()
    
        n = 10
        threads = []
        for thread_number in range(n):
            threads.append(
                container.thread_factory(name='Thread{0}'.format(thread_number)),
            )
        for thread in threads:
            thread.start()
        for thread in threads:
            thread.join()
    
        all_objects = set()
        while not container.queue_provider().empty():
            all_objects.add(container.queue_provider().get())
    
        assert len(all_objects) == len(threads) == n
        # Queue contains same number of objects as number of threads where
        # thread-local singleton provider was used.
    ```
    
4. **Callable Provider**
    
    Callable providers return callable functions
    
    ```python
    import passlib.hash
    
    from dependency_injector import containers, providers
    
    class Container(containers.DeclarativeContainer):
    
        password_hasher = providers.Callable(
            passlib.hash.sha256_crypt.hash,
            salt_size=16,
            rounds=10000,
        )
    
        password_verifier = providers.Callable(passlib.hash.sha256_crypt.verify)
    
    if __name__ == '__main__':
        container = Container()
    
        hashed_password = container.password_hasher('super secret')
        assert container.password_verifier('super secret', hashed_password)
    ```
    
5. **Coroutine Provider**
    
    Coroutine providers are used when creating dependencies for asynchronous operations
    
    ```python
    import asyncio
    
    from dependency_injector import containers, providers
    
    async def coroutine(arg1, arg2):
        await asyncio.sleep(0.1)
        return arg1, arg2
    
    class Container(containers.DeclarativeContainer):
    
        coroutine_provider = providers.Coroutine(coroutine, arg1=1, arg2=2)
    
    if __name__ == '__main__':
        container = Container()
    
        arg1, arg2 = asyncio.run(container.coroutine_provider())
        assert (arg1, arg2) == (1, 2)
        assert asyncio.iscoroutinefunction(container.coroutine_provider)
    ```
    

There are also various other providers built-in. (I haven't used all of them either...)

[**Container**](https://python-dependency-injector.ets-labs.org/containers/index.html)

A container is a collection of providers. You can create application dependencies into a single class to use as a single class or combine multiple containers.

There are two types of containers.

1. Declarative Container

```python
from dependency_injector import containers, providers

class Container(containers.DeclarativeContainer):
    factory1 = providers.Factory(object)
    factory2 = providers.Factory(object)

if __name__ == '__main__':
    container = Container()

    object1 = container.factory1()
    object2 = container.factory2()

    print(container.providers)
    # {
    #     'factory1': <dependency_injector.providers.Factory(...),
    #     'factory2': <dependency_injector.providers.Factory(...),
    # }
```

This is the most basic container used. In most of my use cases, I was able to create containers in a declarative way.

2. Dynamic Container

```python
from dependency_injector import containers, providers

if __name__ == '__main__':
    container = containers.DynamicContainer()
    container.factory1 = providers.Factory(object)
    container.factory2 = providers.Factory(object)

    object1 = container.factory1()
    object2 = container.factory2()

    print(container.providers)
    # {
    #     'factory1': <dependency_injector.providers.Factory(...),
    #     'factory2': <dependency_injector.providers.Factory(...),
    # }
```

Dynamic containers dynamically create dependencies in the container. 

```python
from dependency_injector import containers, providers

class UserService:
    ...

class AuthService:
    ...

def populate_container(container, providers_config):
    for provider_name, provider_info in providers_config.items():
        provided_cls = globals().get(provider_info['class'])
        provider_cls = getattr(providers, provider_info['provider_class'])
        setattr(container, provider_name, provider_cls(provided_cls))

if __name__ == '__main__':
    services_config = {
        'user': {
            'class': 'UserService',
            'provider_class': 'Factory',
        },
        'auth': {
            'class': 'AuthService',
            'provider_class': 'Factory',
        },
    }
    services = containers.DynamicContainer()

    populate_container(services, services_config)

    user_service = services.user()
    auth_service = services.auth()

    assert isinstance(user_service, UserService)
    assert isinstance(auth_service, AuthService)
```

In my personal opinion, this method would inevitably make the application's entry point complex, so I don't recommend it...

However, in unavoidable cases, you can create DI/IoC containers this way.

**Wiring**

This actually serves the role of injecting the dependencies created above into application logic (class methods or functions).

To use dependencies created by containers and their providers, **you must select the Python module to inject into** (Caution!!!)

For parts that directly use wiring, **use the `@inject` decorator**

This decorator can inject two main things:

1. The value that the provider injects
2. The provider itself

Let's learn more through the examples below

1. **Value injected by provider**
    
    ```python
    # containers.py
    from dependency_injector import containers, providers
    
    class User:
    	def __init__(name: str) -> None:
    		self.name = name
    
    class Container(containers.DeclarativeContainer):
        user = providers.Factory(User, name="humphrey")
    
    # main.py
    
    @inject # 1
    def main(user: User = Provide[Container.user]):
    	print(f"He is {user.name}")    
    
    if __name__ == '__main__':
        container = Container()
        container.wire(modules=[sys.modules[__name__]]) # 2
    
        main() # He is Humphrey
    
    ```
    
    `#1` attached the `inject` decorator to the function that will inject dependencies
    
    `#2` wired the module to inject dependencies into (`main` module) to the container
    
    You can see that the name field value of the User object created by the factory provider is properly injected.
    
2. **Provider itself**
    
    ```python
    # containers.py
    from dependency_injector import containers, providers
    
    class User:
    	def __init__(name: str) -> None:
    		self.name = name
    
    class Container(containers.DeclarativeContainer):
        user = providers.Factory(User, name="humphrey")
    
    # main.py
    
    @inject 
    def main(user_provider: Callable[..., User] = Provider[Container.user]): # 1
    	user_humphrey = user_provider() #2
    	print(f"He is {user_humphrey.name}")    
    
    if __name__ == '__main__':
        container = Container()
        container.wire(modules=[sys.modules[__name__]]) 
    
        main() # He is Humphrey
    ```
    
    Note that `#1`'s signature has changed from the example above
    
    When you call user_provider in `#2`, it returns a User object
    

## Examples

- Refactoring dependencies with dependency injector (w. FastAPI)
    
    Let's start with a small CRUD service
    
    ```python
    # domain.py
    
    Base = declarative_base()
    
    class User(Base):
        __tablename__ = "users"
        id: str = sa.Column(sa.String, primary_key=True, default=ulid.new().str)
        name: str = sa.Column(sa.String, nullable=False)
        email: str = sa.Column(sa.String, nullable=False)
    
    # repository.py
    from typing import List
    from sqlalchemy.orm.scoping import ScopedSession
    from app.domain import User
    
    class Repository:
        def __init__(self, session_factory: ScopedSession) -> None:
            self.session_factory = session_factory
    
        def get(self, ref: str) -> User:
            with self.session_factory() as session:
                return session.query(User).filter_by(id=ref).first()
    
        def add(self, user: User) -> None:
            with self.session_factory() as session:
                session.add(user)
                session.commit()
    
        def fetch_all(self) -> List[User]:
            with self.session_factory() as session:
                return session.query(User).all()
    
        def delete_user(self, user_id: str) -> None:
            with self.session_factory() as session:
                found_user = session.query(User).filter_by(id=user_id).first()
                if not found_user:
                    raise
                session.delete(found_user)
                session.commit()
    
    # service.py
    from app.domain import User
    from app.repository import Repository
    
    class Service:
        def __init__(self, repository: Repository) -> None:
            self.repository = repository
    
        def get_by_id(self, id: str):
            return self.repository.get(ref=id)
    
        def add_new_user(self, name: str, email: str) -> None:
            self.repository.add(User(name=name, email=email))
    
        def get_all(self):
            return self.repository.fetch_all()
    
        def delete_user(self, user_id) -> None:
            self.repository.delete_user(user_id=user_id)
    ```
    
    I defined the User domain model, repository, and service.
    
    Since we're using SqlAlchemy, database-related dependencies are needed, and this strongly couples with the FastAPI bootstrap presentation layer
    
    ```python
    from fastapi import FastAPI, Depends, APIRouter
    from pydantic import BaseModel
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.orm.scoping import ScopedSession
    from sqlalchemy.pool import StaticPool
    from starlette.responses import JSONResponse
    
    from app.domain import Base
    from app.repository import Repository
    from app.service import Service
    
    app = FastAPI()
    
    class UserRegisterInSchema(BaseModel):
        name: str
        email: str
    
    # 1
    engine = create_engine(url="sqlite:///", echo=True, connect_args={'check_same_thread': False}, poolclass=StaticPool, )
    
    # 2
    def get_service():
        try:
            session = ScopedSession(sessionmaker(bind=engine))
            repository = Repository(session_factory=session)
            yield Service(repository=repository)
        except Exception:
            raise
        finally:
            pass
    
    @app.on_event("startup")
    async def startup_event():
        Base.metadata.create_all(engine)
    
    @app.get("/users")
    def get_all_users(usecase: Service = Depends(get_service)):
        return usecase.get_all()
    
    @app.get("/users/{user_id}")
    def get_user_by_id(user_id: str, usecase: Service = Depends(get_service)):
        return usecase.get_by_id(id=user_id)
    
    @app.post("/users")
    def register(request: UserRegisterInSchema, usecase: Service = Depends(get_service)):
        try:
            usecase.add_new_user(name=request.name, email=request.email)
        except:
            return JSONResponse(status_code=500, content={"message": "유저 생성이 실패했습니다"})
    
    @app.delete("/users/{user_id}")
    def delete_user(user_id: str, usecase: Service = Depends(get_service)):
        try:
            usecase.delete_user(user_id=user_id)
        except:
            return JSONResponse(status_code=500, content={"message": "유저 삭제가 실패했습니다"})
    ```
    
    #1 had to create the engine as a module global variable because the engine had to be called once in the `get_service` function and once more in `startup_event`. The side effect of this is that if other modules import this module, they can always create a new engine because it's a module variable.
    
    #2 uses FastAPI's Depends feature to create session, repository, and service in order and pass them as a generator through yield expression. (FastAPI provides this method of dependency injection)
    
    The disadvantage of the above code is that, as mentioned, the part that creates FastAPI and router is strongly coupled with database-related logic, making testing difficult.
    
    Next, let's refactor the above code more cleanly with dependency injector
    
    ```python
    from dependency_injector import containers, providers
    from pydantic import BaseSettings, Field
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.orm.scoping import ScopedSession
    from sqlalchemy.pool import StaticPool
    
    from app.repository import Repository
    from app.service import Service
    
    class DatabaseSettings(BaseSettings):
        url: str = Field(default="sqlite:///", env="db_url")
    
    class ApplicationSettings(BaseSettings):
        db = DatabaseSettings()
    
    class ApplicationContainer(containers.DeclarativeContainer):
        config = providers.Configuration()
        engine = providers.Singleton(create_engine, url=config.db.url, echo=True,
                                     connect_args={'check_same_thread': False},
                                     poolclass=StaticPool)
        session_factory = providers.Singleton(sessionmaker, bind=engine)
        session = providers.Singleton(ScopedSession, session_factory)
        repository = providers.Factory(Repository, session_factory=session)
        service = providers.Factory(Service, repository=repository)
    ```
    
    I moved the database-related logic from main.py and the creation logic for repository and service to dependency-injector. I was also able to add the functionality to receive the db url from environment variables, which didn't exist before.
    
    Using dependency-injector this way makes main.py much lighter
    
    ```python
    import sys
    
    import uvicorn
    from dependency_injector.wiring import Provide, inject
    from fastapi import FastAPI, Depends
    from pydantic import BaseModel
    from starlette.responses import JSONResponse
    
    from app.containers import ApplicationContainer, ApplicationSettings
    from app.domain import Base
    from app.service import Service
    
    class UserRegisterInSchema(BaseModel):
        name: str
        email: str
    
    app = FastAPI()
    
    @app.get("/users")
    @inject
    def get_all_users(usecase: Service = Depends(Provide[ApplicationContainer.service])):
        return usecase.get_all()
    
    @app.get("/users/{user_id}")
    @inject
    def get_user_by_id(user_id: str, usecase: Service = Depends(Provide[ApplicationContainer.service])):
        return usecase.get_by_id(id=user_id)
    
    @app.post("/users")
    @inject
    def register(request: UserRegisterInSchema, usecase: Service = Depends(Provide[ApplicationContainer.service])):
        try:
            usecase.add_new_user(name=request.name, email=request.email)
        except:
            return JSONResponse(status_code=500, content={"message": "유저 생성이 실패했습니다"})
    
    @app.delete("/users/{user_id}")
    @inject
    def delete_user(user_id: str, usecase: Service = Depends(Provide[ApplicationContainer.service])):
        try:
            usecase.delete_user(user_id=user_id)
        except:
            return JSONResponse(status_code=500, content={"message": "유저 삭제가 실패했습니다"})
    
    if __name__ == '__main__':
        container = ApplicationContainer()
        container.config.from_pydantic(ApplicationSettings())
        container.wire([sys.modules[__name__]])
        Base.metadata.create_all(container.engine()) #3
        uvicorn.run(app=app)
    ```
    
    1. FastAPI bootstrapping code and database-related code have been decoupled.
    2. inject decorator has been added to the router
    3. Dependency injection control that was in the get_service function has been moved to ApplicationContainer
    4. The create_all function that was in the startup method has been moved to __main__. This was an unavoidable choice because FastAPI cannot use depends functions during startup. There might be a way to solve this with dependency injector 

## Summary

Python is a multi-paradigm language. I think you don't need to know object orientation in detail like Java, and you can use it according to your purpose regardless of whether it's functional or whatever orientation. (Actually, you can write it however you want - what language doesn't allow that...). However, to write maintainable code in a team of scale, you inevitably encounter many problems that object orientation tries to solve, and I think there's a big difference between knowing and not knowing these solutions.

Even if someone might not like the way dependency injector implements dependency injection, I personally like it and apply it to almost all projects. Let's write code that manages dependencies well so that anyone who takes over my code can easily understand the core logic and easily add features (really...)

**Personal Thoughts**

- Since it's a difficult concept, I was confused about whether I was expressing it correctly while writing.
- I want to code well