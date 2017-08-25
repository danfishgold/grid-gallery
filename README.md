# Grid Gallery

I listened to the [Presentable episode][presentable] with [Jen Simmons][jen],
and then I saw Jen's [very good talk][talk] about CSS grid and ideas for layout
on the web.

But I had different ideas in mind: I wanted to make a gallery page, and since
grid has a built in layout engine, which can position things in a grid
automatically so that there will be no overlap, it was the perfect opportunity
to make a gallery page without worrying about the layout.

During this last weekend all the courses on [Code School][codeschool]
were free (thanks @orta for retweeting [this][retweet]), and I did a bunch of
them. Specifically the ones about ES6 and MongoDB. I used the opportunity to
make a more well rounded app.

I don't think I'll continue working on this, at least in the near future.

## Instructions

You'll need Elm, Node, and MongoDB for this project. Honestly, the Elm part
could have been implemented in JS but I love Elm.

You also need an AWS account with S3, because `uploader.js` uploads photos from
a `example-photos` directory to S3. The AWS credentials and bucket name
are stored in a `.env` file.

First, you need to install the node modules:

    npm install

And then run the following commands:

    mongod --dbpath=/data --port 27017
    node uploader.js

This will start the database and begin to upload the photos
from `example-photos/` to S3. It will upload both the original files
and a scaled down version that will be displayed in the gallery.
It will also save information about the photos in mongo.

After `uploader.js` has finished, you should run

    elm-make Main.elm --output elm.js
    node server.js

to build the client page and start the server.

Finally, open `index.html` in your browser of choice (which supports CSS grid).

[presentable]: https://www.relay.fm/presentable/28
[jen]: http://jensimmons.com
[talk]: https://www.youtube.com/watch?v=Qof0XB0yaDs
[codeschool]: https://www.codeschool.com
[retweet]: https://twitter.com/thekitze/status/898521172228419584
