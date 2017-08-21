module Main exposing (..)

import Html exposing (Html, program, div)
import Photo exposing (Photo)
import Http


type alias Model =
    { photos : List Photo }


type Msg
    = GotPhotos (Result Http.Error (List Photo))


init : ( Model, Cmd Msg )
init =
    ( { photos = [] }, Http.send GotPhotos Photo.getAll )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        GotPhotos (Ok photos) ->
            ( { model | photos = photos }, Cmd.none )

        GotPhotos (Err error) ->
            ( model, Cmd.none )


view : Model -> Html Msg
view model =
    model.photos
        |> List.map Photo.view
        |> div []


main : Program Never Model Msg
main =
    program
        { init = init
        , subscriptions = subscriptions
        , update = update
        , view = view
        }
