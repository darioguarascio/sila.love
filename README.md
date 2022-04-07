# sila.love

This is the result of an attempt of taking real ownership of a chinese webcam product
as a consequence for a peculiar Christmas gift.

## History - the idea.

August 2019. Christmas is approaching, as is the stressing "need to gift" period.
(Yes, 5 months in advance.)
In order to avoid the many random presents due to a large number of family members,
I opt for a collective one, abstract in its form but filled with meaning:

An instant access to the live view of familiy's most common place, the only place where,
once a year, a reunion takes place, where we all share the magnificent presence of
Mother Nature in all its glory and beauty.


### Requirements - the initial attempt

To act upon this plan, the first device required is a solar-powerd, 4G, outdoor webcam.
A brief search on amazon results in [finding one](https://www.amazon.it/gp/product/B07QKR3DFM/ref=ppx_yo_dt_b_asin_title_o02_s00?ie=UTF8&psc=1) (not available anymore).

The hardware looks solid and well made, and it doesn't take much to set it up and running.
The collective Chirstmas present is ready: sharing the details of how to access the view.


### First issues - usability

The webcam feed is only accessible using the related app, [I-Cam](https://play.google.com/store/apps/details?id=com.ubia.xiaochang&gl=US).
Not any other option. Not even a web interface (which would have simplified this whole think by a lot).
The more tech advanced members of the family find no problems in getting along,
while the less geeks ones (like a 80yo woman) are less prone to dive into apps and setups.
The present should be for everyone, not just younglings.


### Later issues - reliability

The webcam perishes to the harsh, below 0, temperatures of the environment it is exposed to.
Mountain winters are no joke, not even to lifeless machines.
The beefy 4 18650 3,7 V lithium batteries cannot get enough juice from the small solar panel.
A solution is found is attempted first in August 2021 and then found in October 2021.


### Onwership attempt #1: getting in touch

The first approach was the most friendly one: asking for help, more details about the insights of a product
I spent money to.

- Writing an email to the app author: no response
- Writing an email to the parent company (ubia): no response.

**FAILURE**


### Ownership attempt #2: reverse engineering

After evidence that a reply to my email was never going to happen, the second strategy took place.
Decompiling the app, sneaking into the code, trying to figure out protocols, involved servers, etc.
I imagined that whoever developed this app did not reinvent the wheel about video streams encoding.

The outcome of this process was just a gigantic 1984 vibe, where chinese servers where receiving the
video feed before sending it back to the client.

Figuring out the details of the used protocol was too time consuming, I gave up.

** FAILURE**


## Ownership attempt #3: KISS.

I figured that the app was allowing screenshots to be taken, and I imagined that a live video feed
was not strictly necessary to give out the "always available" view my initial present idea was supposed to.
Thanks to [adb](https://developer.android.com/studio/command-line/adb) and [Genymotion](https://www.genymotion.com/), creating a set of delayed taps and a subsequent fetching of the generated screenshot was a much easier sort-of-solution.

Once the jpg file was obtained, handling was no issue, and after a nice cropping with `convert` to remove that ugly and _unremovable_ timestamp impressed on the feed, the image was ready.

- rename to `"webcam-$(date +'%Y.%m.%d-%H.%M').jpg"`
- copy to a remote sftp, in a `/$Y/$M/$D` folder structure
- storing the last saved image into a file


**SUCCESS**