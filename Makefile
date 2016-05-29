docs: clearguides \
			copyguides \
			buildapidocs \
			copyapidocs \
			buildcounterdocs \
			copycounterdocs \
			buildtodomvcdocs \
			copytodomvcdocs \
			buildgraphdocs \
			copygraphdocs \
			buildlogindocs \
			copylogindocs \
			buildformdocs \
			copyformdocs \
			build \
			copytodest

clearguides:
	rm -rf docs
	rm -rf dest

copyguides:
	mkdir -p docs/guides
	cp -r ../keechma/guides/* docs/guides
	cp ../keechma/README.md docs/guides.md

buildapidocs:
	cd ../keechma && lein codox
	cd ../entitydb && lein codox
	cd ../router && lein codox
	cd ../forms && lein codox

copyapidocs:
	mkdir -p docs/api
	cp -r ../keechma/target/doc docs/api/keechma
	cp -r ../entitydb/target/doc docs/api/entitydb
	cp -r ../router/target/doc docs/api/router
	cp -r ../forms/target/doc docs/api/forms

buildcounterdocs:
	cd ../keechma-counter && lein marg

copycounterdocs:
	mkdir -p docs/annotated
	cp ../keechma-counter/docs/uberdoc.html docs/annotated/counter.html

buildtodomvcdocs:
	cd ../keechma-todomvc && lein marg

copytodomvcdocs:
	mkdir -p docs/annotated
	cp ../keechma-todomvc/docs/uberdoc.html docs/annotated/todomvc.html

buildgraphdocs:
	cd ../keechma-graph-data && lein marg

copygraphdocs:
	mkdir -p docs/annotated
	cp ../keechma-graph-data/docs/uberdoc.html docs/annotated/graph-data.html

buildlogindocs:
	cd ../keechma-login && lein marg

copylogindocs:
	mkdir -p docs/annotated
	cp ../keechma-login/docs/uberdoc.html docs/annotated/login.html

buildformdocs:
	cd ../keechma-forms-example && lein marg

copyformdocs:
	mkdir -p docs/annotated
	cp ../keechma-forms-example/docs/uberdoc.html docs/annotated/form-example.html

build:
	node index.js

deploy:
	node deploy.js

copytodest:
	rm -rf content/guides
	rm -rf content/annotated/*/
	rm -rf content/api/*/
	cp -r dest/guides content/guides
	cp -r dest/annotated/* content/annotated/
	cp -r dest/api/* content/api
	touch content/guides/contents.lr
	touch content/annotated/contents.lr
	touch content/api/contents.lr
