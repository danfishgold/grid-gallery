module Photo exposing (Photo, getAll, view)

import Json.Decode as Decode exposing (Decoder, string, int)
import Http
import Html exposing (Html, img)
import Html.Attributes exposing (classList, style, src)


type AspectRatio
    = Portrait
    | Landscape
    | Square


type alias Photo =
    { dominantColor : String
    , width : Int
    , height : Int
    , url : String
    , isFav : Bool
    }


getAll : Http.Request (List Photo)
getAll =
    Http.get "http://localhost:3000/photos" (Decode.list decoder)


decoder : Decoder Photo
decoder =
    Decode.map5 Photo
        (Decode.field "dominantColor" string)
        (Decode.field "width" int)
        (Decode.field "height" int)
        (Decode.field "url" string)
        (Decode.succeed False)


aspectRatio : Photo -> AspectRatio
aspectRatio photo =
    if toFloat photo.width / toFloat photo.height > 1.2 then
        Landscape
    else if toFloat photo.height / toFloat photo.width > 1.2 then
        Portrait
    else
        Square


view : Photo -> Html msg
view photo =
    let
        aspectRatioClass =
            case aspectRatio photo of
                Portrait ->
                    "portrait"

                Landscape ->
                    "landscape"

                Square ->
                    "square"
    in
        img
            [ classList [ ( aspectRatioClass, True ), ( "fav", photo.isFav ) ]
            , src photo.url
            , style
                [ ( "background", photo.dominantColor )
                , ( "max-width", "100%" )
                , ( "max-height", "100%" )
                ]
            ]
            []
